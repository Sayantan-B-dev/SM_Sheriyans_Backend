import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL, // e.g. llama-3.1-8b-instant
  temperature: 0.7,
});

const prompt = PromptTemplate.fromTemplate(`
Explain {topic} in a very simple ELI5 way.
Include only the core concepts.
Avoid unnecessary jargon.
Be as concise as possible.
`);

const chain = prompt.pipe(llm);

const res = await chain.invoke({
  topic: "last qn",
});


console.log(res.content);
