const postModel=require("../models/post.model")
const generateContent=require("../service/ai.service")

const createPostController=async(req,res)=>{
    const file=req.file

    const base64Image=Buffer.from(file.buffer).toString('base64')
    
    const caption=await generateContent(base64Image)

    console.log("Generated caption : ",caption)
    res.json({Generated_caption:caption})
}

module.exports=createPostController