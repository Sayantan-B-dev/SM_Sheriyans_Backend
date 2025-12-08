const mongoose=require('mongoose')
require('dotenv').config()

function connectDB(){
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("DB connected"))
    .catch((e)=>console.log(e))
}
module.exports=connectDB