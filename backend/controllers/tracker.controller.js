const pool = require("../db/pool");
const { getAuth } = require("@clerk/express");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

async function createApplication(req, res) {
  try {
    const { university_id, status } = req.body;
    const { userId: clerkUserId, sessionClaims } = getAuth(req);
    const email = sessionClaims?.email || sessionClaims?.email_address || null;
    const localUser = await ensureLocalUser(pool, clerkUserId, email);
    const user_id = localUser.id;

    if (!university_id) {
      return res.status(400).json({ error: "university_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, university_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, university_id, status || "Not Started"]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listApplications(req, res) {
  try {
    const { userId: clerkUserId, sessionClaims } = getAuth(req);
    const email = sessionClaims?.email || sessionClaims?.email_address || null;
    const localUser = await ensureLocalUser(pool, clerkUserId, email);
    const user_id = localUser.id;

    const result = await pool.query(
      `SELECT 
         a.id AS application_id,
         a.status,
         a.user_id,
         u.id AS university_id,
         u.name,
         u.city,
         u.country,
         u.program,
         u.deadline
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.user_id = $1
       ORDER BY a.id DESC`,
      [user_id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { userId: clerkUserId, sessionClaims } = getAuth(req);
    const email = sessionClaims?.email || sessionClaims?.email_address || null;
    const localUser = await ensureLocalUser(pool, clerkUserId, email);
    const user_id = localUser.id;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found (or not yours)" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteApplication(req, res) {
  try {
    const { id } = req.params;
    const { userId: clerkUserId, sessionClaims } = getAuth(req);
    const email = sessionClaims?.email || sessionClaims?.email_address || null;
    const localUser = await ensureLocalUser(pool, clerkUserId, email);
    const user_id = localUser.id;

    const result = await pool.query(
      `DELETE FROM applications
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found (or not yours)" });
    }

    return res.json({ deleted: true, application: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
  deleteApplication,
};