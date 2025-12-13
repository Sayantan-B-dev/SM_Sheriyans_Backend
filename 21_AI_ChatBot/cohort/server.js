require('dotenv').config()
const app = require("./src/app");
const { createServer } = require("http");
const { Server } = require("socket.io");


const generateResponse=require("./src/services/ai.service")


const httpServer = createServer(app);


// 👉 Attach socket.io to the same server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (msg) => {
    console.log(socket.id," - ",msg);
    socket.broadcast.emit("message", msg);
  });

  socket.on("ai-message",async(data)=>{
      console.log("User: ", data.prompt)
      const response=await generateResponse(data.prompt)
      console.log("AI: ", response)
      socket.emit("ai-message-response",{response})
  })


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});