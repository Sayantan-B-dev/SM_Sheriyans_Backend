const express=require("express")
const connectDB=require("./src/db/db")


connectDB()
const port=3000
const app=express()
app.use(express.json())




app.listen(port,()=>{
    console.log("server running on port : "+port)
})