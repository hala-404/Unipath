const express = require("express");
const cors = require("cors");
const { clerkMiddleware, requireAuth, getAuth } = require("@clerk/express");
require("dotenv").config();
const { runReminderCheck } = require("./jobs/reminder.job");
const { validateEnv } = require("./config/env");
validateEnv();

const pool = require("./db/pool");
const chatRoutes = require("./routes/chat.routes");

const profileRoutes = require("./routes/profile.routes");
const trackerRoutes = require("./routes/tracker.routes");
const universityRoutes = require("./routes/university.routes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

async function ensureClerkUserColumn() {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS clerk_user_id TEXT
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_user_id_unique
    ON users (clerk_user_id)
    WHERE clerk_user_id IS NOT NULL
  `);
}

ensureClerkUserColumn().catch((err) => {
  console.error("Failed to ensure users.clerk_user_id schema:", err.message);
});

// Routes
app.use("/profile", profileRoutes);
app.use("/applications", trackerRoutes);
app.use("/universities", universityRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("UniPath Backend is running");
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
// Start server (keep this at the bottom)
const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));