const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");
const { logActivity } = require("../utils/logActivity");

async function getProfile(req, res) {
  try {
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;

    const result = await pool.query(
      `SELECT full_name, gpa, preferred_city, preferred_country, preferred_program, preferred_language, max_tuition, reminders_enabled
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    throw err;
  }
}

async function updateProfile(req, res) {
  try {
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;
    const {
      full_name,
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
         full_name = $1,
         gpa = $2,
         preferred_city = $3,
         preferred_country = $4,
         preferred_program = $5,
         preferred_language = $6,
         max_tuition = $7,
         reminders_enabled = $8
       WHERE id = $9
       RETURNING full_name, gpa, preferred_city, preferred_country, preferred_program, preferred_language, max_tuition, reminders_enabled`,
      [
        full_name?.trim() || null,
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

    await logActivity(user_id, "updated", "profile", "Profile information");

    return res.json({
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (err) {
    throw err;
  }
}

module.exports = { getProfile, updateProfile };