const express = require("express")
const jwt = require("jsonwebtoken")

const router = express.Router()

const {
    registerController,
    loginController,
    logoutController,
    userController
}=require("../controllers/auth.controller")

router.post('/register', registerController)

router.post('/login', loginController)

router.get('/user', logoutController)

router.get('/logout',userController)


module.exports = router