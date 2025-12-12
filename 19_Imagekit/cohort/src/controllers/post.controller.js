const postModel=require("../models/post.model")
const generateContent=require("../service/ai.service")
const uploadImage=require("../service/storage.service")
const {v4:uuidv4}=require('uuid')

const createPostController=async(req,res)=>{
    const file=req.file

    const base64Image=Buffer.from(file.buffer).toString('base64')
    
    const caption=await generateContent(base64Image)
    if (!caption) {
        return res.status(500).json({ message: "AI failed, try again" });
    }
    const result=await uploadImage(
        file.buffer, 
        `${uuidv4()}`
    )
    const post=await postModel.create({
        caption:caption,
        image:result.url,
        user:req.user._id
    })

    res.status(201).json({
        message:"Post created successfully",
        post
    })
}

module.exports=createPostController