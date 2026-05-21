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

dotenv.config();

const app = express();

// 🔥 Wrap express inside HTTP server
const server = createServer(app);

// 🔥 Attach socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    // origin: "http://localhost:5173",
    credentials: true,
  },
});

// ---------------- MIDDLEWARE ----------------

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

// ---------------- ROUTES ----------------

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.use("/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("ConnectNext backend running");
});

// ---------------- SOCKET LOGIC ----------------

// 🔥 In-memory store
const roomUsers = {};
io.on("connection", (socket) => {
  socket.on("typing", ({ roomId, username }) => {
    socket.to(String(roomId)).emit("typing", { username });
  });
  socket.on("joinRoom", ({ roomId, username }) => {
    const room = String(roomId);

    socket.join(room);

    // 🔥 store user info on socket
    socket.username = username;
    socket.roomId = room;

    // 🔥 initialize room if not exists
    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }

    // 🔥 avoid duplicates
    const alreadyExists = roomUsers[room].some(
      (user) => user.socketId === socket.id,
    );

    if (!alreadyExists) {
      roomUsers[room].push({
        socketId: socket.id,
        username,
      });
    }

    // 🔥 notify others
    socket.to(room).emit("systemMessage", {
      message: `${username} joined the room`,
    });

    // 🔥 send updated user list to room
    io.to(room).emit(
      "roomUsers",
      roomUsers[room].map((u) => u.username),
    );
  });
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const { roomId, message, username } = data;

    try {
      // 🔥 Get user_id from username
      const userResult = await pool.query(
        "SELECT id FROM users WHERE username=$1",
        [username],
      );

      const userId = userResult.rows[0]?.id;

      // 🔥 Save message in DB with correct user_id
      await pool.query(
        "INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3)",
        [roomId, userId, message],
      );

      // 🔥 Send to room
      io.to(String(roomId)).emit("receiveMessage", {
        roomId,
        message,
        username,
        time: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("disconnect", () => {
    const room = socket.roomId;
    const username = socket.username;

    if (room && roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter((u) => u.socketId !== socket.id);

      socket.to(room).emit("systemMessage", {
        message: `${username} left the room`,
      });

      io.to(room).emit(
        "roomUsers",
        roomUsers[room].map((u) => u.username),
      );
    }

    console.log("User disconnected:", socket.id);
  });
});

// ---------------- START SERVER ----------------

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
