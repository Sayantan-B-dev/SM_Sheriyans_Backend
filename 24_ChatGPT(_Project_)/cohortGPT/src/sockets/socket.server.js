const { Server } = require("socket.io")
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const messageModel = require("../models/message.model")
const generateResponse = require("../services/groq.service")


function initSocketServer(httpServer) {
    const io = new Server(httpServer, {})

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

        if (!cookies.token) {
            next(new Error("No token provided"))
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)

            const user = await userModel.findById(decoded.id)

            socket.user = user

            next()
        } catch (e) {
            next(new Error("Invalid token"))
        }
    })


    io.on("connection", (socket) => {
        socket.on("ai-message", async (messagePayload) => {
            //console.log(messagePayload)

            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user_id,
                content: messagePayload.content,
                role: "user"
            })


            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat
            }).sort({createdAt:-1}).limit(20).lean()).reverse()

            const response = await generateResponse(chatHistory.map(item=>{
                return{
                    role:item.role,
                    parts:[{text:item.content}]
                }
            }))

            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user_id,
                content: response,
                role: "model"
            })


            //console.log(response)
            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat
            })
        })
    })
}

module.exports = initSocketServer