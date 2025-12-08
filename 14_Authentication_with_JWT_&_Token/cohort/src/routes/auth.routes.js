const express = require("express")
const userModel = require("../models/user.model")
const router = express.Router()

// router.use((req,res,next)=>{
//     console.log("middleware between router and api")
//     next()
// })


router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body

        const existingUser = await userModel.findOne({ username });
        
        if(existingUser){

            res.status(409).json({
                message: "Username already exists"
            })

        }else {
    
            const user = await userModel.create({
                username, password
            })

            res.status(200).json({
                message: "Registered succesfully"
            })
        }
    } catch (e) {
        res.status(500).json({
            message: "Something wrong"
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        
        const isUser = await userModel.findOne({ username });
        
        if(!isUser){
            res.status(409).json({
                message: "User doesnt exist"
            })
            return
        }

        const isPasswordValid=(password==isUser.password)
        console.log(isPasswordValid)
        if(!isPasswordValid){
            res.status(401).json({
                message: "invalid password"
            })
            return
        }


        res.status(200).json({
            message: "Logged in succesfully"
        })
        
    } catch (e) {
        res.status(500).json({
            message: "Something wrong"
        })
    }
})


module.exports = router