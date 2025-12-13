const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

module.exports = async function generateResponse(payload) {
  const messages = payload.contents.map(item => ({
    role: item.role === "model" ? "assistant" : "user",
    content: item.parts[0].text
  }));

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;

  } catch (err) {
    // 🔒 graceful fallback
    console.error("Groq model error:", err.message);
    return "⚠️ AI model temporarily unavailable. Please try again.";
  }
};
