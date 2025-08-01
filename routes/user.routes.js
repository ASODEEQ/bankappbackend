const express = require('express')
const app = express()
app.use(express.urlencoded({extended: true}))
const {signupPage,loginPage, forgotPass, DashboardData, authenticateToken, resolveAccount, transferFunds, depositFunds, getTransactionHistory}= require('../controller/user.controller')
const TransactionHistoryModel = require('../models/transactionHistory.model')
const router = express.Router()





router.post('/signup', signupPage)
router.post('/login', loginPage)
router.post('/forgotpass', forgotPass)
router.get('/dashboard/:id',authenticateToken, DashboardData)
router.post('/resolveAccount', resolveAccount)
router.post('/transferfunds/:id', authenticateToken, transferFunds)
router.post('/deposit/:id',authenticateToken, depositFunds)
router.get('/transactions/:id', authenticateToken, getTransactionHistory)





module.exports=router