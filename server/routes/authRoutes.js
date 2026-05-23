import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

// Express Router Initialization
const router = express.Router();

// User Registration Route
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert User Into Database
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username`,
      [username, email, hashedPassword],
    );

    // Session Creation
    req.session.user = result.rows[0];

    // Registration Success Response
    res.json({ message: "Registered successfully", user: result.rows[0] });
  } catch (err) {
    // Error Handling
    console.error(err);
    res.status(500).json(err.message);
  }
});

// User Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch User From Database
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    // User Validation
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Password Verification
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Session Storage
    req.session.user = {
      id: user.id,
      username: user.username,
    };

    // Login Success Response
    res.json({
      message: "Login successful",
      user: req.session.user,
    });
  } catch (error) {
    // Error Handling
    res.status(500).json({ message: "Login failed" });
  }
});

// User Logout Route
router.post("/logout", (req, res) => {
  // Session Destruction
  req.session.destroy();

  // Logout Success Response
  res.json({ message: "Logged out" });
});

// Current User Route
router.get("/me", (req, res) => {
  // Session Check
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// Export Router
export default router;
