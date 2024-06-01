import { Server } from "socket.io";

export function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join-whiteboard", (whiteboardId) => {
      socket.join(whiteboardId);
      console.log(`User joined whiteboard: ${whiteboardId}`);
    });

    socket.on("draw", (data) => {
      socket.to(data.whiteboardId).emit("draw", data);
    });

    socket.on("clear", (whiteboardId) => {
      socket.to(whiteboardId).emit("clear");
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return io;
}
