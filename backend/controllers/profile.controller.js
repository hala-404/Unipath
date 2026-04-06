const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

async function getProfile(req, res) {
  try {
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;

    const result = await pool.query(
      `SELECT id, email, gpa, preferred_city, preferred_program, preferred_language, reminders_enabled
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
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;
    const { gpa, preferred_city, preferred_program, preferred_language, reminders_enabled } = req.body;


    if (gpa !== undefined && gpa !== null) {
      const gpaNum = Number(gpa);
      if (Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
        return res.status(400).json({ error: "gpa must be between 0 and 4" });
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
         gpa = COALESCE($1, gpa),
         preferred_city = COALESCE($2, preferred_city),
         preferred_program = COALESCE($3, preferred_program),
         preferred_language = COALESCE($4, preferred_language),
         reminders_enabled = COALESCE($5, reminders_enabled)
       WHERE id = $6
       RETURNING id, email, gpa, preferred_city, preferred_program, preferred_language, reminders_enabled`,
      [
        gpa === undefined ? null : gpa,
        preferred_city === undefined ? null : preferred_city,
        preferred_program === undefined ? null : preferred_program,
        preferred_language === undefined ? null : preferred_language,
        reminders_enabled === undefined ? null : reminders_enabled,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "Profile updated",
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getProfile, updateProfile };