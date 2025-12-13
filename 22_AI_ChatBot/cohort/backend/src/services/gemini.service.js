const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = ai.getGenerativeModel({
  model: "gemini-2.5-flash",
});

module.exports = async function generateResponse(payload) {
  const result = await model.generateContent(payload);
  return result.response.text();
};
