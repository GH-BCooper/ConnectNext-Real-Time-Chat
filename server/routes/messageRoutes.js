import express from "express";
import pool from "../db.js";

// Express Router Initialization
const router = express.Router();

// Fetch Messages By Room ID
router.get("/:roomId", async (req, res) => {
  // Request Parameters
  const { roomId } = req.params;

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
});

// Export Router
export default router;
