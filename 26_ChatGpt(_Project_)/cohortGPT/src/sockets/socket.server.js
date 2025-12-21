const { Server } = require("socket.io")
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const messageModel = require("../models/message.model")
const { generateResponse } = require("../services/groq.service")
const { generateVector } = require("../services/embedding.service")
const { createMemory, queryMemory } = require("../services/vector.service")



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

            //WORKING WITH MESSAGE
            const message = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user_id,
                content: messagePayload.content,
                role: "user"
            })
            const vectors = await generateVector(messagePayload.content)

            const memory = await queryMemory({
                queryVector:vectors,
                limit: 3,
                metadata: {}
            })

            await createMemory({
                vectors,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                },
                messageId: message.id
            })


            //WORKING WITH MEMORY


            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat
            }).sort({ createdAt: -1 }).limit(20).lean()).reverse()


            //GETTING RESPONSE
            const response = await generateResponse(chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            }))


            //WORKING WITH RESPONSE
            const responseMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user_id,
                content: response,
                role: "model"
            })
            const responseVectors = await generateVector(messagePayload.content)
            await createMemory({
                vectors: responseVectors,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                },
                messageId: responseMessage.id
            })

            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat
            })
        })
    })
}

module.exports = initSocketServer