const mongoose = require('mongoose')




const TransactionHistorySchema = mongoose.Schema({
    amountDebited: {type: Number, required: true},
    amountCredited: {type: Number, required: true},
    transactionType: {type: Array, required: true}


})