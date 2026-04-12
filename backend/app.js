const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { clerkMiddleware } = require("@clerk/express");

const chatRoutes = require("./routes/chat.routes");
const profileRoutes = require("./routes/profile.routes");
const trackerRoutes = require("./routes/tracker.routes");
const universityRoutes = require("./routes/university.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const errorHandler = require("./middleware/errorHandler");
const pool = require("./db/pool");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

if (process.env.NODE_ENV === "test") {
  app.use((req, res, next) => next());
} else {
  app.use(clerkMiddleware());
}

app.use("/profile", profileRoutes);
app.use("/applications", trackerRoutes);
app.use("/universities", universityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, db_time: result.rows[0].now });
  } catch (err) {
    throw err;
  }
});

app.get("/", (req, res) => {
  res.send("UniPath Backend is running");
});

app.use(errorHandler);

module.exports = app;
