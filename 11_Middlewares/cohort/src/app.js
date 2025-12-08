const express=require("express")
const indexRoutes=require("./routes/index.routes")
const app=express()


app.use((req,res,next)=>{
    console.log("middleware between app and route")
    next()
})
app.use('/',indexRoutes)

module.exports=app