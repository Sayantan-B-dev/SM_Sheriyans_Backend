require("dotenv").config()
const { generateResponse } = require("./src/services/groq.service")
const { splitMessage } = require("./src/helper/splitMessage")
const { getSTM, addSTM, fetchDiscordSTM } = require("./src/memory/stm");

const { Client, GatewayIntentBits } = require("discord.js")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.once("clientReady", () => {
    console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return
    try {
        const userId = message.author.id;

        const stmData = getSTM(userId);
        let history = stmData.history;
        if (!history || history.length === 0) {
            history = await fetchDiscordSTM(message, 12);
        }

        const messages = [
            ...history,
            { role: "user", content: message.content }
        ];

        const response = await generateResponse(messages);

        addSTM(userId, { role: "user", content: message.content });
        addSTM(userId, { role: "assistant", content: response });

        const parts = splitMessage(response);

        for (const part of parts) {
            await message.channel.send(part);
        }
    } catch (err) {
        console.error("Message handler error:", err);
    }
})

process.on("unhandledRejection", console.error);
client.on("error", console.error);

client.login(process.env.DISCORD_BOT_TOKEN)