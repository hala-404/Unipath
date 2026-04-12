require("dotenv").config();
require("./jobs/reminder.job");
const { validateEnv } = require("./config/env");
validateEnv();

const app = require("./app");
const pool = require("./db/pool");

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

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));