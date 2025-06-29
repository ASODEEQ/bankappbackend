const mongoose = require("mongoose");



let userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    profileImage: {type: String, required: false},
    email: {type: String, required: true, unique: true},
    phoneNumber: {type: String, required: true},
    accountNumber:{type: Number, required: true},
    accountBalance:{type: Number, required: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, default: false},
    dateCreated: {type: String, default: Date.now()}
})

let userModel =   mongoose.model('users', userSchema)


module.exports= userModel