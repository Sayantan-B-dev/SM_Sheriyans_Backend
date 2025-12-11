const express=require("express")
const authRoutes=require("./routes/auth.routes")
const cookieParser=require("cookie-parser")
const app=express()
app.use(express.json())
app.use(cookieParser())

// app.use((req,res,next)=>{
//     console.log("middleware between app and route")
//     next()
// })
app.use('/api/auth',authRoutes)

module.exports=app