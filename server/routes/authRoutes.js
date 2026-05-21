import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username`,
      [username, email, hashedPassword]
    );

    req.session.user = result.rows[0];

    res.json({ message: "Registered successfully", user: result.rows[0] });

  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.json({
      message: "Login successful",
      user: req.session.user
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Logout the user
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

// Get current user info
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

export default router;