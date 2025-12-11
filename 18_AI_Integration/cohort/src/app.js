const express=require("express")

const authRoutes=require("./routes/auth.routes")
const postRoutes=require("./routes/post.routes")



const cookieParser=require("cookie-parser")
const app=express()
app.use(express.json())
app.use(cookieParser())

// app.use((req,res,next)=>{
//     console.log("middleware between app and route")
//     next()
// })
app.use('/api/auth',authRoutes)
app.use('/api/post',postRoutes)

module.exports=app