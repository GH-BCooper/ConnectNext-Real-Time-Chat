import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";

// Express Router Initialization
const router = express.Router();

// Fetch Messages By Room ID (Protected - Requires Authentication)
router.get("/:roomId", checkAuth, async (req, res) => {
  // Request Parameters
  const { roomId } = req.params;

  try {
    // Database Query
    const result = await pool.query(
      `SELECT m.content, u.username
     FROM messages m
     JOIN users u ON m.user_id = u.id
     WHERE m.room_id=$1
     ORDER BY m.created_at ASC`,
      [roomId],
    );

    // API Response
    res.json(result.rows);
  } catch (error) {
    // Error Handling
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Export Router
export default router;
