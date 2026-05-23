import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Environment Variable Configuration
dotenv.config();

// Express Application Initialization
const app = express();

// HTTP Server Creation
const server = createServer(app);

// Socket.IO Server Configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  },
});

// Middleware Configuration
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  }),
);

// API Routes
app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/messages", messageRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("ConnectNext backend running");
});

// In-Memory Room User Store
const roomUsers = {};

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  // Typing Event Handler
  socket.on("typing", ({ roomId, username }) => {
    socket.to(String(roomId)).emit("typing", { username });
  });

  // Room Join Event Handler
  socket.on("joinRoom", ({ roomId, username }) => {
    const room = String(roomId);

    // Join Socket Room
    socket.join(room);

    // Store User Information On Socket
    socket.username = username;
    socket.roomId = room;

    // Room Initialization
    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }

    // Duplicate User Prevention
    const alreadyExists = roomUsers[room].some(
      (user) => user.socketId === socket.id,
    );

    // Add User To Room
    if (!alreadyExists) {
      roomUsers[room].push({
        socketId: socket.id,
        username,
      });
    }

    // Notify Other Users
    socket.to(room).emit("systemMessage", {
      message: `${username} joined the room`,
    });

    // Broadcast Updated User List
    io.to(room).emit(
      "roomUsers",
      roomUsers[room].map((u) => u.username),
    );
  });

  // Connection Log
  console.log("User connected:", socket.id);

  // Message Sending Event Handler
  socket.on("sendMessage", async (data) => {
    const { roomId, message, username } = data;

    try {
      // Fetch User ID From Database
      const userResult = await pool.query(
        "SELECT id FROM users WHERE username=$1",
        [username],
      );

      const userId = userResult.rows[0]?.id;

      // Store Message In Database
      await pool.query(
        "INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3)",
        [roomId, userId, message],
      );

      // Broadcast Message To Room
      io.to(String(roomId)).emit("receiveMessage", {
        roomId,
        message,
        username,
        time: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      // Error Handling
      console.error("Error sending message:", err);
    }
  });

  // Disconnect Event Handler
  socket.on("disconnect", () => {
    const room = socket.roomId;
    const username = socket.username;

    // Remove User From Room
    if (room && roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter((u) => u.socketId !== socket.id);

      // Notify Room About User Leaving
      socket.to(room).emit("systemMessage", {
        message: `${username} left the room`,
      });

      // Broadcast Updated User List
      io.to(room).emit(
        "roomUsers",
        roomUsers[room].map((u) => u.username),
      );
    }

    // Disconnection Log
    console.log("User disconnected:", socket.id);
  });
});

// Server Startup
server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
