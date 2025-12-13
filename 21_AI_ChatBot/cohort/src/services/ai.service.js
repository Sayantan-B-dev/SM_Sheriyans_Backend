require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize AI client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = ai.getGenerativeModel({model: "gemini-2.5-flash"});

const generateResponse = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        return result.response.text()
    } catch (e) {
        console.log(e)
        return null
    }
}

module.exports = generateResponse