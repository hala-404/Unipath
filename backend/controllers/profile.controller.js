const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

async function ensureProfileColumns() {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_country TEXT
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS max_tuition NUMERIC
  `);
}

async function getProfile(req, res) {
  try {
    await ensureProfileColumns();
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;

    const result = await pool.query(
      `SELECT gpa, preferred_city, preferred_country, preferred_program, preferred_language, max_tuition, reminders_enabled
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    await ensureProfileColumns();
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;
    const {
      gpa,
      preferred_city,
      preferred_country,
      preferred_program,
      preferred_language,
      max_tuition,
      reminders_enabled,
    } = req.body;

    if (gpa !== null && gpa !== undefined) {
      const numericGpa = Number(gpa);

      if (Number.isNaN(numericGpa) || numericGpa < 0 || numericGpa > 4) {
        return res.status(400).json({ message: "GPA must be between 0 and 4" });
      }
    }

    if (max_tuition !== null && max_tuition !== undefined) {
      const numericMaxTuition = Number(max_tuition);

      if (Number.isNaN(numericMaxTuition) || numericMaxTuition < 0) {
        return res.status(400).json({ message: "Maximum tuition must be 0 or more" });
      }
    }

    if (reminders_enabled !== undefined && reminders_enabled !== null) {
      if (typeof reminders_enabled !== "boolean") {
        return res.status(400).json({ error: "reminders_enabled must be a boolean" });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET
         gpa = $1,
         preferred_city = $2,
         preferred_country = $3,
         preferred_program = $4,
         preferred_language = $5,
         max_tuition = $6,
         reminders_enabled = $7
       WHERE id = $8
       RETURNING gpa, preferred_city, preferred_country, preferred_program, preferred_language, max_tuition, reminders_enabled`,
      [
        gpa ?? null,
        preferred_city ?? null,
        preferred_country ?? null,
        preferred_program ?? null,
        preferred_language ?? null,
        max_tuition ?? null,
        reminders_enabled ?? true,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getProfile, updateProfile };