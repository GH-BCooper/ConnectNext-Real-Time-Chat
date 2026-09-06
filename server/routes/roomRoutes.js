import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";

// Express Router Initialization
const router = express.Router();

// Fetch All Chat Rooms (Protected - Requires Authentication)
router.get("/", checkAuth, async (req, res) => {
  try {
    // Database Query - newest rooms first, with message counts
    const result = await pool.query(
      `SELECT r.*, COUNT(m.id)::int AS message_count
       FROM rooms r
       LEFT JOIN messages m ON m.room_id = r.id
       GROUP BY r.id
       ORDER BY r.id ASC`,
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Create A New Chat Room (Protected)
router.post("/", checkAuth, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Room name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO rooms (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim().slice(0, 50), (description || "").trim().slice(0, 300), req.session.user.id],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Room names are unique in the database
    if (error.code === "23505") {
      return res.status(400).json({ message: "A room with that name already exists" });
    }
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Error creating room" });
  }
});

// Export Router
export default router;
