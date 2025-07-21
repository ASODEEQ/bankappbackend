const express = require('express') 
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json({limit:'50mb'}))
const mongoose  = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const userRoutes = require('./routes/user.routes')
app.use('/user', userRoutes)





let URI = process.env.DATABASE_URL

console.log(URI);
mongoose.connect(URI)
.then(()=>{
console.log('connected to server successfully');
}).catch((err)=>{
    if(err){
        console.log('cannot connect to the database');
        console.log(err);
        
        
    }
})

// app.get('/signup',(req, res)=>{
//     res.send('hello')

// })

app.get('/', (req,res)=>{

    res.send({status: true, message: 'bank app working fine' })
})



let port = 5000
app.listen(port, (err)=>{
    if(err){
        console.log('cannot start server');
        
    }else{
        console.log(`server started at ${port}`);
        
    }



})
