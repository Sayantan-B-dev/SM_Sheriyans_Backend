require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize AI client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent("Explain how AI converts Image to Text");
    
    console.log(result.response.text());
}

main();
