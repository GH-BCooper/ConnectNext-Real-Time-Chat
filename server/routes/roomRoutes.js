import express from "express";
import pool from "../db.js";
import { checkAuth } from "../middleware/auth.js";

// Express Router Initialization
const router = express.Router();

// Fetch All Chat Rooms (Protected - Requires Authentication)
router.get("/", checkAuth, async (req, res) => {
  try {
    // Database Query
    const result = await pool.query("SELECT * FROM rooms");

    // API Response
    res.json(result.rows);
  } catch (error) {
    // Error Handling
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// Export Router
export default router;
