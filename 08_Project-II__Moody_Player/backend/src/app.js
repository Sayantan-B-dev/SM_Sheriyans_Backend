const express =require("express")
const songRouters=require('./routes/song.routes')

const app=express()
app.use(express.json())

app.use('/',songRoutes)

module.exports=app