import pg from "pg";
import dotenv from "dotenv";

// Environment Variable Configuration
dotenv.config();

const { Pool } = pg;

// PostgreSQL Connection Pool Configuration
let pool;

// Prefer DATABASE_URL for production, fall back to individual env variables for development
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
} else {
  // For local development, use individual environment variables
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
}

// Export Database Pool
export default pool;
