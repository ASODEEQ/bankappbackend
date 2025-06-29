const express = require('express')
const app = express()
app.use(express.urlencoded({extended: true}))
const {signupPage,checkk,loginPage, forgotPass, DashboardData, authenticateToken}= require('../controller/user.controller')
const router = express.Router()





router.post('/signup', signupPage)
router.post('/login', loginPage)
router.post('/forgotpass', forgotPass)
router.get('/dashboard/:id',authenticateToken, DashboardData)
router.get('/checkk', checkk)





module.exports=router