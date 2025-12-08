const express=require("express")
const router=express.Router()
const multer=require("multer")
const uploadFile=require('../service/storage.service')

const upload=multer({storage:multer.memoryStorage()})


router.post('/songs',upload.single('audio'),async (req,res)=>{
    console.log(req.body)
    console.log(req.file)
    const fileData=await uploadFile(req.file)
    console.log(fileData)
    res.status(200).json({
        message:"song created succesfully",
        song:req.body,
    })
})


module.exports = router