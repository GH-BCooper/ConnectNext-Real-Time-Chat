import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;

  const result = await pool.query(
    `SELECT m.content, u.username
   FROM messages m
   JOIN users u ON m.user_id = u.id
   WHERE m.room_id=$1
   ORDER BY m.created_at ASC`,
    [roomId],
  );

  res.json(result.rows);
});

export default router;
