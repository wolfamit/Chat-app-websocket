import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  roomId: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  // Listen for messages from the client
  socket.on("message", (data) => {
    try {
      const parsedMessage = JSON.parse(data.toString());

      if (parsedMessage.type === "join") {
        // Handle joining a room
        allSockets.push({
          socket,
          roomId: parsedMessage.payload.roomId,
        });
        console.log(`User joined room: ${parsedMessage.payload.roomId}`);
      }

      if (parsedMessage.type === "chat") {
        // Handle sending a chat message to a room
        const currentUser = allSockets.find((x) => x.socket === socket);
        if (currentUser) {
          const currentUserRoom = currentUser.roomId;
          allSockets.forEach((user) => {
            if (user.roomId === currentUserRoom) {
              user.socket.send(parsedMessage.payload.message);
            }
          });
        } else {
          console.warn("Socket not found in user list.");
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  // Handle client disconnection
  socket.on("close", () => {
    allSockets = allSockets.filter((user) => user.socket !== socket);
    console.log("A user disconnected.");
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});
