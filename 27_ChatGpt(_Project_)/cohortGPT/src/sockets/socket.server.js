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

    // ===================================================================== //
    // SOCKET.IO AUTH MIDDLEWARE
    // Runs BEFORE the "connection" event
    // Purpose: Validate the user's JWT token and attach user data to socket
    // ===================================================================== //
    io.use(async (socket, next) => {

        // =============================================================== //
        // 1️⃣ READ TOKEN FROM CLIENT COOKIES
        // =============================================================== //
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

        // If token not found → deny access
        if (!cookies.token) {
            return next(new Error("No token provided"))
        }

        // =============================================================== //
        // 2️⃣ VERIFY JWT TOKEN
        // =============================================================== //
        try {
            const decoded = jwt.verify(
                cookies.token,
                process.env.JWT_SECRET
            )

            // =========================================================== //
            // 3️⃣ FETCH USER FROM DATABASE
            // =========================================================== //
            const user = await userModel.findById(decoded.id)

            // Attach user object to socket instance
            // So we can access socket.user anywhere later
            socket.user = user

            // Allow connection to proceed
            next()

        } catch (e) {

            // If anything fails → reject connection
            next(new Error("Invalid token"))
        }
    })


    // ========================= SOCKET: ON CONNECTION ========================= //
    io.on("connection", (socket) => {

        // ===================================================================== //
        // LISTEN FOR USER AI MESSAGE EVENT
        // ===================================================================== //
        socket.on("ai-message", async (messagePayload) => {

            // ========================= 1️⃣ SAVE USER MESSAGE ========================= //
            // Store the incoming message in MongoDB
            const message = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user_id,
                content: messagePayload.content,
                role: "user"
            })

            // ========================= 2️⃣ VECTORIZE USER MESSAGE ========================= //
            // Convert the message content into vector embedding
            const vectors = await generateVector(messagePayload.content)

            // ========================= 3️⃣ QUERY VECTOR MEMORY ========================= //
            // Search nearest memory vectors based on similarity
            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {
                    user: socket.user._id
                }
            })

            // ========================= 4️⃣ STORE MESSAGE AS MEMORY ========================= //
            // Save vector + metadata about the message for later recall
            await createMemory({
                vectors,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                },
                messageId: message.id
            })


            // ===================================================================== //
            // BUILD CHAT HISTORY CONTEXT FOR LLM
            // ===================================================================== //

            // Get latest 20 messages from this chat in correct order
            const chatHistory = (
                await messageModel.find({ chat: messagePayload.chat })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean()
            ).reverse()

            const stm = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            const ltm = [
                {
                    role: "user",
                    parts: [{
                        text: `These are some previous messages from the chat. Use them to generate a response:\n\n${memory.map(m => m.metadata.text).join("\n")}`
                    }]

                }
            ]


            // const util = require("util")
            // console.log(
            //     "Long Term Memory :",
            //     util.inspect(ltm, { depth: null, colors: true })
            // )
            // console.log(
            //     "Short Term Memory :",
            //     util.inspect(stm, { depth: null, colors: true })
            // )


            // ===================================================================== //
            // GENERATE MODEL RESPONSE USING CHAT HISTORY
            // ===================================================================== //

            const response = await generateResponse([...ltm, ...stm])


            // ========================= 5️⃣ SAVE MODEL RESPONSE ========================= //
            // Store generated response in database
            const responseMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user_id,
                content: response,
                role: "model"
            })


            // ========================= 6️⃣ VECTORIZE RESPONSE ========================= //
            const responseVectors = await generateVector(messagePayload.content)


            // ========================= 7️⃣ STORE RESPONSE AS MEMORY ========================= //
            await createMemory({
                vectors: responseVectors,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                },
                messageId: responseMessage.id
            })


            // ===================================================================== //
            // SEND FINAL RESPONSE BACK TO FRONTEND
            // ===================================================================== //

            socket.emit("ai-response", {
                content: response,
                chat: messagePayload.chat
            })
        })
    })

}

module.exports = initSocketServer