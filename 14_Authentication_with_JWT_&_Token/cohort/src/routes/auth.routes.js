const express = require("express")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

const router = express.Router()

// router.use((req,res,next)=>{
//     console.log("middleware between router and api")
//     next()
// })


router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body

        const existingUser = await userModel.findOne({ username });

        if (existingUser) {

            res.status(409).json({
                message: "Username already exists"
            })

        } else {

            const user = await userModel.create({
                username, password
            })

            const token = jwt.sign({
                id: user._id,
            }, process.env.JWT_SECRET)

            res.cookie("token", token)

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

        if (!isUser) {
            res.status(409).json({
                message: "User doesnt exist"
            })
            return
        }

        const isPasswordValid = (password == isUser.password)



        if (!isPasswordValid) {
            res.status(401).json({
                message: "invalid password"
            })
            return
        }

        const token = jwt.sign({
            id: user._id,
        }, process.env.JWT_SECRET)

        res.cookie("token", token,{
            expires:new Date(Date.now()+1000*60*60*24*7)
        })


        res.status(200).json({
            message: "Logged in succesfully"
        })

    } catch (e) {
        res.status(500).json({
            message: "Something wrong"
        })
    }
})

router.get('/user', async (req, res) => {
    const { token } = req.cookies
    if (!token) {
        return res.status(401).json({
            message: "unauthorized"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const foundUser = await userModel.findOne({
            _id: decoded.id
        }).select("-password").lean()

        res.status(200).json({
            foundUser: foundUser
        })


    } catch (e) {
        return res.status(401).json({
            message: "Unauthorized - invalid token"
        })
    }


})

router.get('/logout',(req,res)=>{
    res.clearCookie('token')
    res.status(200).json({
        message:"user logged out successfully"
    })
})


module.exports = router