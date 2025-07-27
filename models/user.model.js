const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profileImage: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now() }, 
    accountNumber: { type: String, unique: true } ,
    accountBalance: {type: Number, default: 100}
    
});



userSchema.pre('save', async function(next) {
    if (!this.accountNumber) {
        try {
            let isUnique = false;
            let accountNumber;
            let attempts = 0;
            const maxAttempts = 10; // Prevent infinite loops
            
            while (!isUnique && attempts < maxAttempts) {
                attempts++;
                // Generate 10-digit account number (8 random + 2 prefix)
                accountNumber = `ESB${Math.floor(10000000 + Math.random() * 90000000)}`;
                const existingUser = await mongoose.model('users').findOne({ accountNumber });
                
                if (!existingUser) {
                    isUnique = true;
                }
            }
            
            if (!isUnique) {
                throw new Error('Could not generate unique account number after maximum attempts');
            }
            
            this.accountNumber = accountNumber;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

const User = mongoose.model('users', userSchema);

module.exports = User;