import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";
import {
  aiAvailable,
  AI_MODEL_NAME,
  getConversationSummary,
  getIcebreakers,
  getPolishedMessage,
  getQuiz,
  getRoomVibe,
  runCompanion,
} from "../lib/ai.js";

const router = express.Router();

// Small guard so every AI route degrades gracefully without an API key.
function requireAI(res) {
  if (aiAvailable()) return true;
  res.status(503).json({
    unavailable: true,
    message:
      "AI features are off. Add ANTHROPIC_API_KEY to server/.env and restart the server.",
  });
  return false;
}

// AI availability + model info (used by the client to show/hide AI UI)
router.get("/status", (req, res) => {
  res.json({ available: aiAvailable(), model: AI_MODEL_NAME });
});

// Summarize recent messages in a room
router.get("/summarize/:roomId", checkAuth, async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const result = await pool.query(
      `SELECT m.content, u.username
       FROM messages m JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [req.params.roomId],
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

// Suggest conversation starters for a room
router.get("/icebreakers/:roomId", checkAuth, async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const room = await pool.query("SELECT name FROM rooms WHERE id = $1", [
      req.params.roomId,
    ]);
    if (room.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const recent = await pool.query(
      `SELECT m.content, u.username
       FROM messages m JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [req.params.roomId],
    );

    const ideas = await getIcebreakers(room.rows[0].name, recent.rows.reverse());
    res.json({ ideas });
  } catch (error) {
    console.error("Error generating icebreakers:", error);
    res.status(500).json({ message: "Error generating icebreakers" });
  }
});

// Polish / rewrite a draft message
router.post("/polish", checkAuth, async (req, res) => {
  if (!requireAI(res)) return;
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

// NEW (v5) — generate a recall quiz from a study session
router.get("/quiz/:roomId", checkAuth, async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const room = await pool.query("SELECT name FROM rooms WHERE id = $1", [
      req.params.roomId,
    ]);
    if (room.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const recent = await pool.query(
      `SELECT m.content, u.username
       FROM messages m JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 60`,
      [req.params.roomId],
    );

    const quiz = await getQuiz(room.rows[0].name, recent.rows.reverse());
    res.json(quiz);
  } catch (error) {
    console.error("Error building quiz:", error);
    res.status(500).json({ message: "Error building the quiz" });
  }
});

// Focus check — how the study session is going
router.get("/vibe/:roomId", checkAuth, async (req, res) => {
  if (!requireAI(res)) return;
  try {
    const room = await pool.query("SELECT name FROM rooms WHERE id = $1", [
      req.params.roomId,
    ]);
    if (room.rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const recent = await pool.query(
      `SELECT m.content, u.username
       FROM messages m JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 40`,
      [req.params.roomId],
    );

    const vibe = await getRoomVibe(room.rows[0].name, recent.rows.reverse());
    res.json(vibe);
  } catch (error) {
    console.error("Error reading room vibe:", error);
    res.status(500).json({ message: "Error reading the room" });
  }
});

// AI Tutor: multi-turn chat that can query the user's study data
const companionTools = [
  {
    name: "search_messages",
    description:
      "Full-text search across every study-room message the user can see. Returns up to 12 matches with room name, author and text.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Words to search for" } },
      required: ["query"],
    },
  },
  {
    name: "list_rooms",
    description: "List every study room with its subject and message count.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "my_stats",
    description:
      "Get the current user's own study progress: username, join date, messages sent, rooms created.",
    input_schema: { type: "object", properties: {} },
  },
];

async function runCompanionTool(name, input, userId) {
  if (name === "search_messages") {
    const q = String(input.query || "").trim().slice(0, 80);
    if (!q) return "No query provided.";
    const rows = (
      await pool.query(
        `SELECT m.content, u.username, r.name AS room, m.created_at
         FROM messages m
         JOIN users u ON m.user_id = u.id
         JOIN rooms r ON m.room_id = r.id
         WHERE m.content ILIKE $1
         ORDER BY m.created_at DESC
         LIMIT 12`,
        [`%${q}%`],
      )
    ).rows;
    if (!rows.length) return `No messages match "${q}".`;
    return rows
      .map(
        (m) =>
          `[${m.room}] ${m.username}: ${m.content} (${new Date(m.created_at).toLocaleString()})`,
      )
      .join("\n");
  }

  if (name === "list_rooms") {
    const rows = (
      await pool.query(
        `SELECT r.name, r.description, COUNT(m.id)::int AS message_count
         FROM rooms r LEFT JOIN messages m ON m.room_id = r.id
         GROUP BY r.id ORDER BY r.id ASC`,
      )
    ).rows;
    return rows
      .map(
        (r) =>
          `${r.name} — ${r.description || "no description"} (${r.message_count} messages)`,
      )
      .join("\n");
  }

  if (name === "my_stats") {
    const [profile, messages, rooms] = await Promise.all([
      pool.query("SELECT username, created_at FROM users WHERE id = $1", [userId]),
      pool.query("SELECT COUNT(*)::int AS c FROM messages WHERE user_id = $1", [userId]),
      pool.query("SELECT COUNT(*)::int AS c FROM rooms WHERE created_by = $1", [userId]),
    ]);
    const p = profile.rows[0];
    if (!p) return "User not found.";
    return `username: ${p.username}, joined: ${new Date(p.created_at).toLocaleDateString()}, messages sent: ${messages.rows[0].c}, rooms created: ${rooms.rows[0].c}`;
  }

  return `Unknown tool: ${name}`;
}

router.post("/companion", checkAuth, async (req, res) => {
  if (!requireAI(res)) return;
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array is required" });
  }
  try {
    const userId = req.session.user.id;
    const { reply, toolsUsed } = await runCompanion(
      messages,
      companionTools,
      (name, input) => runCompanionTool(name, input, userId),
    );
    res.json({ reply, toolsUsed });
  } catch (error) {
    console.error("Companion error:", error);
    res.status(500).json({ message: "The Companion hit an error. Try again." });
  }
});

export default router;
