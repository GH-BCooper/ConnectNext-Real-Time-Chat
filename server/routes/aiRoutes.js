import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";
import {
  getConversationSummary,
  getIcebreakers,
  getPolishedMessage,
} from "../lib/ai.js";

// Express Router Initialization
const router = express.Router();

// Summarize Recent Messages In A Room (Protected)
router.get("/summarize/:roomId", checkAuth, async (req, res) => {
  const { roomId } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.content, u.username
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [roomId],
    );

    if (result.rows.length === 0) {
      return res.json({ summary: "There are no messages in this room yet." });
    }

    const summary = await getConversationSummary(result.rows.reverse());
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing conversation:", error);
    res.status(500).json({ message: "Error generating summary" });
  }
});

// Suggest Conversation Starters For A Room (Protected)
router.get("/icebreakers/:roomId", checkAuth, async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await pool.query("SELECT name FROM rooms WHERE id = $1", [roomId]);

    if (room.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const recent = await pool.query(
      `SELECT m.content, u.username
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [roomId],
    );

    const ideas = await getIcebreakers(room.rows[0].name, recent.rows.reverse());
    res.json({ ideas });
  } catch (error) {
    console.error("Error generating icebreakers:", error);
    res.status(500).json({ message: "Error generating icebreakers" });
  }
});

// Polish / Rewrite A Draft Message (Protected)
router.post("/polish", checkAuth, async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Nothing to polish" });
  }

  try {
    const polished = await getPolishedMessage(text.trim().slice(0, 1000));
    res.json({ polished });
  } catch (error) {
    console.error("Error polishing message:", error);
    res.status(500).json({ message: "Error polishing message" });
  }
});

// Export Router
export default router;
