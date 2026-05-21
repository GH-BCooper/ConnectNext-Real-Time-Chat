import { io } from "socket.io-client";

const socket = io("https://connectnext-backend.onrender.com", {
  withCredentials: true,
  transports: ["websocket"], // 🔥 ADD THIS
});

export default socket;
