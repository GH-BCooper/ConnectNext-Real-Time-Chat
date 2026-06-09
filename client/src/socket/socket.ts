import { io } from "socket.io-client";

// Socket Connection Configuration
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

// Export Socket Instance
export default socket;
