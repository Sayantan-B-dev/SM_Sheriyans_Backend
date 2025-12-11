const jwt=require("jsonwebtoken")
const userModel=require("../models/user.model")

const authMiddleware=async(req,res)=>{
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    try{
        //jwt throws error if its wrong
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const existingUser=await usserModel.findOne({
            _id:decoded.id
        })
        req.user=user
        next()//needed
    }catch(e){
        res.send(401).json("Please Login")
        console.log("Something wrong: "+express)
    }
}

module.exports=authMiddleware