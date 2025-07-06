const express = require('express')
const app = express()
app.use(express.urlencoded({extended: true}))
const {signupPage,checkk,loginPage, forgotPass, DashboardData, authenticateToken, resolveAccount}= require('../controller/user.controller')
const router = express.Router()





router.post('/signup', signupPage)
router.post('/login', loginPage)
router.post('/forgotpass', forgotPass)
router.get('/dashboard/:id',authenticateToken, DashboardData)
router.get('/checkk', checkk)
router.post('/resolveAccount', resolveAccount)





module.exports=router