const bcrypt =require("bcrypt")
const jwt =require("jsonwebtoken")
const userModel = require("../models/user.model")


const registerController=async (req, res) => {
    try {
        const { username, password } = req.body

        const existingUser = await userModel.findOne({ username });

        if (existingUser) {

            res.status(409).json({
                message: "Username already exists"
            })

        } else {

            const user = await userModel.create({
                username, password: await bcrypt.hash(password,10)
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
            message: "Something wrong: "+e
        })
    }
}

const loginController=async (req, res) => {
    try {
        const { username, password } = req.body

        const isUser = await userModel.findOne({ username });

        if (!isUser) {
            res.status(409).json({
                message: "User doesnt exist"
            })
            return
        }

        const isPasswordValid =await bcrypt.compare(password,isUser.password)

        if (!isPasswordValid) {
            res.status(401).json({
                message: "invalid password"
            })
            return
        }


        const token = jwt.sign({
            id: isUser._id
        }, process.env.JWT_SECRET)

        res.cookie("token", token,{
            expires:new Date(Date.now()+1000*60*60*24*7)
        })


        res.status(200).json({
            message: "Logged in succesfully"
        })

    } catch (e) {
        res.status(500).json({
            message: "Something wrong: "+e
        })
    }
}

const userController=async (req, res) => {
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
}

const logoutController=(req,res)=>{
    res.clearCookie('token')
    res.status(200).json({
        message:"user logged out successfully"
    })
}

module.exports={
    registerController,
    loginController,
    logoutController,
    userController
}