const jwt=require("jsonwebtoken")
const userModel=require("../models/user.model")

const authMiddleware=async(req,res,next)=>{
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    try{
        //jwt throws error if its wrong
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const existingUser=await userModel.findOne({
            _id:decoded.id
        })
        req.user=existingUser
        next()//needed
    }catch(e){
        return res.status(401).json({ message: "Please Login" });
        console.log("Something wrong: "+e)
    }
}

module.exports=authMiddleware