const express =require("express")
const songRouters=require('./routes/songs.routes')

const app=express()
app.use(express.json())

app.use('/',songRouters)

module.exports=app