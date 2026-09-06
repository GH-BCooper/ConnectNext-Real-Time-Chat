import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";

// Express Router Initialization
const router = express.Router();

// Fetch The Logged-In User's Profile + Simple Stats (Protected)
router.get("/stats", checkAuth, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const [profile, messages, rooms] = await Promise.all([
      pool.query(
        "SELECT id, username, email, created_at FROM users WHERE id = $1",
        [userId],
      ),
      pool.query("SELECT COUNT(*)::int AS count FROM messages WHERE user_id = $1", [
        userId,
      ]),
      pool.query("SELECT COUNT(*)::int AS count FROM rooms WHERE created_by = $1", [
        userId,
      ]),
    ]);

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...profile.rows[0],
      messageCount: messages.rows[0].count,
      roomsCreated: rooms.rows[0].count,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Export Router
export default router;
