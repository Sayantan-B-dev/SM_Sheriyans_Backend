const { Server } = require("socket.io");
const chatSocket = require("./chat.socket");

module.exports = function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    chatSocket(io, socket);
  });
};
