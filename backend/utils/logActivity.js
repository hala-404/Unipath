const pool = require("../db/pool");

async function logActivity(userId, action, entity, entityName) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, entity, entity_name)
       VALUES ($1, $2, $3, $4)`,
      [userId, action, entity, entityName]
    );
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
}

module.exports = { logActivity };
