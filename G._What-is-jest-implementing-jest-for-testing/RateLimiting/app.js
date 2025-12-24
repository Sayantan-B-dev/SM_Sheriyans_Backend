const express=require('express')
const rateLimit=require('express-rate-limit')


const app=express()
const limiter=rateLimit({
    window:1*60*1000,//ms..1 min
    max:10,
    message:"too many requests from this ip, wait 1 min"
})
//can be use redis to syncronize

app.post(
    '/api/auth/register',
    limiter,
    (req,res)=>{
        res.status(201).json({message:"user registered"})
    }
)

app.listen(3000,()=>console.log("in3000"))
