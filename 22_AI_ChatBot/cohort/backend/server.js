require("dotenv").config();
const { createServer } = require("http");
const app = require("./src/app");
const initSocket = require("./src/socket");

const httpServer = createServer(app);

// attach socket.io
initSocket(httpServer);

httpServer.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
