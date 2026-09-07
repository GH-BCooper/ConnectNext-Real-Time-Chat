import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../db.js";
import { isMailConfigured, sendPasswordResetEmail } from "../lib/mailer.js";

// Express Router Initialization
const router = express.Router();

// How long a password reset link stays valid
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Hash a raw reset token before it ever touches the database
const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Make sure the password_resets table exists (older local DBs won't have it)
let resetTableReady = null;
function ensurePasswordResetsTable() {
  if (!resetTableReady) {
    resetTableReady = pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  return resetTableReady;
}

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
    console.error(err);

    // Handle duplicate email (PostgreSQL unique constraint violation)
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already in use" });
    }

    res.status(500).json({ message: "Registration failed" });
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

// Forgot Password Route — issues a reset token for the given email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email is required" });
  }

  // Generic response — never reveal whether an account exists for this email
  const genericResponse = {
    message:
      "If an account exists for that email, a password reset link has been generated.",
  };

  try {
    await ensurePasswordResetsTable();

    const result = await pool.query(
      "SELECT id, username FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.json(genericResponse);
    }

    const user = result.rows[0];

    // Raw token goes to the user; only its hash is stored
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // One active token per user — drop any previous ones
    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [user.id]);
    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password?token=${rawToken}`;

    // Email the link to the account holder
    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch (mailErr) {
      console.error("Failed to send password reset email:", mailErr);
    }

    // If SMTP isn't configured, fall back to handing the link back directly
    // (dev/local only) so password recovery still works.
    if (!isMailConfigured() && process.env.NODE_ENV !== "production") {
      return res.json({ ...genericResponse, resetLink });
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("forgot-password error:", err);
    res.status(500).json({ message: "Could not process the request" });
  }
});

// Reset Password Route — consumes a token and sets a new password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Reset token is missing" });
  }
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    await ensurePasswordResetsTable();

    const tokenHash = hashResetToken(token);
    const result = await pool.query(
      `SELECT id, user_id, expires_at
         FROM password_resets
        WHERE token_hash = $1`,
      [tokenHash],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    const record = result.rows[0];

    if (new Date(record.expires_at).getTime() < Date.now()) {
      await pool.query("DELETE FROM password_resets WHERE id = $1", [record.id]);
      return res.status(400).json({ message: "This reset link has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      record.user_id,
    ]);

    // Token is single-use — clear every reset row for this user
    await pool.query("DELETE FROM password_resets WHERE user_id = $1", [
      record.user_id,
    ]);

    res.json({ message: "Password updated. You can now sign in." });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ message: "Could not reset the password" });
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
