const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { runReminderCheck } = require("./jobs/reminder.job");
const { validateEnv } = require("./config/env");
validateEnv();

const pool = require("./db/pool");
const chatRoutes = require("./routes/chat.routes");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const trackerRoutes = require("./routes/tracker.routes");
const universityRoutes = require("./routes/university.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
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