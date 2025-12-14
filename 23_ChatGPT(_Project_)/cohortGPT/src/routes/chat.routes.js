const express=require("express")
const chatController =require("../controller/chat.controller")
const authMiddleware=require("../middlewares/auth.middleware")

const router=express.Router()

router.post(
    '/',
    authMiddleware.authUser,
    chatController.createChat
)


module.exports=router