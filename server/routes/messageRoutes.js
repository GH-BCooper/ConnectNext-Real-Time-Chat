import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";

// Express Router Initialization
const router = express.Router();

// Fetch The Most Recent Messages By Room ID (Protected - Requires Authentication)
router.get("/:roomId", checkAuth, async (req, res) => {
  const { roomId } = req.params;

  try {
    // Grab the last 100 messages, then return them oldest-first for display
    const result = await pool.query(
      `SELECT * FROM (
         SELECT m.id, m.content, u.username, m.created_at
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.room_id = $1
         ORDER BY m.created_at DESC
         LIMIT 100
       ) recent
       ORDER BY created_at ASC`,
      [roomId],
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Export Router
export default router;
