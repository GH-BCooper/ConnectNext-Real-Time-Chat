import { io } from "socket.io-client";

// Socket Connection Configuration
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Retrieve JWT Token
const token = localStorage.getItem("token");

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
  auth: { token }, // ← sends token to Socket.IO JWT middleware
});

// Export Socket Instance
export default socket;


// import { io } from "socket.io-client";

// // Socket Connection Configuration
// const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const socket = io(SOCKET_URL, {
//   withCredentials: true,
//   transports: ["websocket"],
// });

// // Export Socket Instance
// export default socket;
