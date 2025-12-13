// const generateResponse = require("../services/gemini.service");
const generateResponse = require("../services/groq.service");

// tuning knobs (easy to change later)
const RATE_LIMIT_MS = 5000;        // 1 request / 5 sec
const MAX_MEMORY_TURNS = 12;       // last N messages kept

module.exports = function chatSocket(io, socket) {

  // per-user short-term memory (isolated per socket)
  const chatHistory = [];

  // per-user rate limit timestamp
  let lastAIRequestTime = 0;

  socket.on("message", (msg) => {
    console.log(`[MSG] ${socket.id}:`, msg);
    socket.broadcast.emit("message", msg);
  });

  socket.on("ai-message", async (data) => {
    try {
      const now = Date.now();

      // ---- RATE LIMIT ----
      if (now - lastAIRequestTime < RATE_LIMIT_MS) {
        return socket.emit("ai-message-response", {
          response: "⏳ Please wait a few seconds before asking again."
        });
      }
      lastAIRequestTime = now;

      // ---- INPUT SAFETY ----
      const prompt = String(data?.prompt || "").trim();
      if (!prompt) {
        return socket.emit("ai-message-response", {
          response: "⚠️ Empty prompt received."
        });
      }

      console.log(`[AI USER] ${socket.id}:`, prompt);

      // ---- STORE USER MESSAGE ----
      chatHistory.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      // ---- MEMORY TRIMMING ----
      if (chatHistory.length > MAX_MEMORY_TURNS) {
        chatHistory.splice(0, chatHistory.length - MAX_MEMORY_TURNS);
      }

      // ---- AI CALL ----
      const response = await generateResponse({
        contents: chatHistory,
      });

      console.log(`[AI BOT] ${socket.id}:`, response);

      // ---- STORE AI MESSAGE ----
      chatHistory.push({
        role: "model",
        parts: [{ text: response }],
      });

      socket.emit("ai-message-response", { response });

    } catch (err) {
      console.error(`[AI ERROR] ${socket.id}:`, err.message);

      socket.emit("ai-message-response", {
        response: "⚠️ AI service unavailable. Please try again."
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] ${socket.id}`);
  });
};
