const express=require("express")
const connectDB=require("./src/db/db")
const noteModel=require("./src/models/note.model")

connectDB()
const port=3000
const app=express()
app.use(express.json())

app.get("/notes",async (req,res)=>{
    const notes=await noteModel.find()
    res.json({
        message: "Notes fetched succesfuly",
        notes
    })
})

app.post("/notes",async (req,res)=>{
    const {title,content}=req.body

    console.log(title,content)
    await noteModel.create({
        title,
        content
    })
    res.json({
        message:"note created succesfully"
    })
})

app.delete("/notes/:id",async (req,res)=>{
    const noteId=req.params.id
    await noteModel.findOneAndDelete({
        _id:noteId
    })
    res.json({
        message:"note deleted succesfuly"
    })
})

app.patch("/notes/:id",async(req,res)=>{
    const noteId=req.params.id
    const {title,content}=req.body

    await noteModel.findOneAndUpdate(
        {_id:noteId},
        {title,content}
    )
    res.json({
        message:"note updated succesfully"
    })
})


app.listen(port,()=>{
    console.log("server running on port : "+port)
})