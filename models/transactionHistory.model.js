const mongoose = require("mongoose");


const TransactionHistorySchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transactionType:{
    type: String,
    required: true,
    enum: ["deposit", "withdrawal", "transfer", "received"],
  },
  amount: { type: Number, required: true },
  receipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.transactionType === "transfer" || "received";
    },
  },
  accountNumber:{type: String,required: function(){return this.transactionType === 'transfer'|| 'received'}},
  created_at:{type: String, default: Date.now()},
  description:{type: String},
  balance_before: {type: Number, required: true},
  balance_after: {type: Number, required: true},
});
const TransactionHistoryModel = mongoose.model('transactionHistory', TransactionHistorySchema)

module.exports = TransactionHistoryModel
