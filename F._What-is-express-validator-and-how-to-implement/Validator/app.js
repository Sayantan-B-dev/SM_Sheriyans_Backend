const express=require('express')
const validators=require("./middleware/validator.middleware")


const app=express()
app.use(express.json())


app.post(
    '/register',
    validators.registerValidationRules,
    (req,res)=>{
    const {username,email,password}=req.body
        res.send(
            `username: ${username},
            email: ${email},
            password: ${password}`
        )
    }
)

app.listen(3000,()=>console.log("in3000"))
