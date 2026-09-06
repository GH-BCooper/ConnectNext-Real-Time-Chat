import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";
import { getConversationSummary } from "../lib/ai.js";

// Express Router Initialization
const router = express.Router();

// Summarize Recent Messages In A Room (Protected - Requires Authentication)
router.get("/summarize/:roomId", checkAuth, async (req, res) => {
  const { roomId } = req.params;

  try {
    // Fetch Recent Messages
    const result = await pool.query(
      `SELECT m.content, u.username
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.room_id=$1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [roomId],
    );

    if (result.rows.length === 0) {
      return res.json({ summary: "There are no messages in this room yet." });
    }

    // Reverse To Chronological Order
    const messages = result.rows.reverse();

    // Generate Summary
    const summary = await getConversationSummary(messages);

    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing conversation:", error);
    res.status(500).json({ message: "Error generating summary" });
  }
});

// Export Router
export default router;
