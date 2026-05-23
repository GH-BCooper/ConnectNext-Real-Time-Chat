import { io } from "socket.io-client";

// Socket Connection Configuration
const socket = io("https://connectnext-backend.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

// Export Socket Instance
export default socket;
