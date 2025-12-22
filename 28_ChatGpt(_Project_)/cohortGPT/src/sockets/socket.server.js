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
        socket.on("ai-message", async (payload) => {
            //const start = performance.now();
            // ================================================================= //
            // 1️⃣ SAVE USER MESSAGE + VECTORIZE IN PARALLEL                     //
            // ================================================================= //
            const [{ userMessage, userVector }] = await Promise.all([(
                async () => {
                    const userMessage = await messageModel.create({
                        chat: payload.chat,
                        user: socket.user_id,
                        role: "user",
                        content: payload.content
                    });

                    const userVector = await generateVector(payload.content);

                    return { userMessage, userVector };
                }
            )()]);

            // ================================================================= //
            // 2️⃣ QUERY MEMORY + CHAT HISTORY IN PARALLEL                      //
            // ================================================================= //
            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: userVector,
                    limit: 1,
                    metadata: { user: socket.user._id }
                }),
                messageModel.find({ chat: payload.chat })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean()
            ]);

            chatHistory.reverse();


            // ================================================================= //
            // 3️⃣ BUILD PROMPT                                                  //
            // ================================================================= //
            const stm = chatHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));

            const ltm = [
                {
                    role: "user",
                    parts: [{
                        text:
                            `Relevant past messages:\n\n${memory.map(m => m.metadata.text).join("\n")}`
                    }]
                }
            ];


            // ================================================================= //
            // 4️⃣ GENERATE RESPONSE                                             //
            // ================================================================= //
            const aiResponse = await generateResponse([...ltm, ...stm]);


            // ================================================================= //
            // 5️⃣ SEND RESPONSE IMMEDIATELY                                    //
            // ================================================================= //
            socket.emit("ai-response", {
                chat: payload.chat,
                content: aiResponse
            });
            //console.log("⚡ AI Response Time:",(performance.now() - start).toFixed(2),"ms");

            // ================================================================= //
            // 6️⃣ NON-BLOCKING BACKGROUND TASKS                                 //
            // ================================================================= //
            //const bgStart = performance.now();
            ; (async () => {

                // Save user vector → Pinecone
                createMemory({
                    vectors: userVector,
                    metadata: {
                        chat: payload.chat,
                        user: socket.user._id,
                        text: payload.content
                    },
                    messageId: userMessage.id
                });

                // Save AI message + Vectorize + Memory
                const aiMessage = await messageModel.create({
                    chat: payload.chat,
                    user: socket.user_id,
                    role: "model",
                    content: aiResponse
                });

                const aiVector = await generateVector(aiResponse);

                createMemory({
                    vectors: aiVector,
                    metadata: {
                        chat: payload.chat,
                        user: socket.user._id,
                        text: aiResponse
                    },
                    messageId: aiMessage.id
                });
                //console.log("🟡 Background Work Time:",(performance.now() - bgStart).toFixed(2),"ms");
            })();

        });
    });



}

module.exports = initSocketServer