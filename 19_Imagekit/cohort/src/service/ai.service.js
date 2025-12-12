require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize AI client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const generateContent = async (base64ImageFile) => {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = {
            contents: [
                {
                    role: "user",
                    parts:[
                        {text:"You are an AI that creates short, clean captions for images. Do NOT describe unrelated details. use hashtags in captions, total of 2 captions only"}
                    ]
                },
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: base64ImageFile
                            }
                        },
                        {
                            text: "Caption this image."
                        }
                    ]
                }
            ],
        };
        const result = await model.generateContent(prompt)
        return result.response.text()
    } catch (e) {
        console.log(e)
        return null
    }

}

module.exports = generateContent