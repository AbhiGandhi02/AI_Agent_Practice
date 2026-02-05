const { Pool } = require("pg");

/**
 * Database connection pool
 * Uses DATABASE_URL for Supabase connection
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

// Log connection status
pool.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("Database connected");
  }
});

pool.on("error", (err) => {
  console.error("Database error:", err.message);
});

module.exports = pool;
