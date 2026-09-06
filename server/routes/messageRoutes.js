import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";

// Express Router Initialization
const router = express.Router();

// Global message search across every room (Protected).
// NEW in v4 — powers the /explore page. Must be declared before "/:roomId".
router.get("/search", checkAuth, async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT m.id, m.content, u.username, m.created_at,
              r.id AS room_id, r.name AS room_name
       FROM messages m
       JOIN users u ON m.user_id = u.id
       JOIN rooms r ON m.room_id = r.id
       WHERE m.content ILIKE $1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [`%${q}%`],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ message: "Error searching messages" });
  }
});

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
