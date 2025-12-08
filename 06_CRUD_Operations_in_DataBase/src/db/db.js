const mongoose=require("mongoose")

function connectDB(){
    mongoose.connect("mongodb://localhost:27017/notes")
            .then(()=>console.log("connected mongodb"))
}

module.exports=connectDB
