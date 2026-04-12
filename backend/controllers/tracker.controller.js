const pool = require("../db/pool");
const { logActivity } = require("../utils/logActivity");

const defaultChecklist = [
  { label: "Transcript", completed: false, priority: "high" },
  { label: "CV", completed: false, priority: "medium" },
  { label: "Personal Statement", completed: false, priority: "high" },
  { label: "Recommendation Letters", completed: false, priority: "medium" },
  { label: "Language Proficiency", completed: false, priority: "high" },
  { label: "Non-Criminal Record", completed: false, priority: "medium" },
  { label: "Medical Check", completed: false, priority: "medium" },
  { label: "Additional Certificates", completed: false, priority: "medium" },
  { label: "Passport", completed: false, priority: "high" },
];

async function createApplication(req, res) {
  try {
    const { university_id, status } = req.body;
    const user_id = 1;

    if (!university_id) {
      return res.status(400).json({ error: "university_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, university_id, status, checklist)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        user_id,
        university_id,
        status || "Not Started",
        JSON.stringify(defaultChecklist),
      ]
    );

    const universityResult = await pool.query(
      `SELECT name FROM universities WHERE id = $1`,
      [university_id]
    );

    const universityName =
      universityResult.rows[0]?.name || `University #${university_id}`;

    await logActivity(user_id, "added", "university", universityName);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "University already added to tracker" });
    }

    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function listApplications(req, res) {
  try {
    const user_id = 1;

    const result = await pool.query(
      `SELECT 
         a.id AS application_id,
         a.status,
         a.user_id,
         a.checklist,
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
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = 1;

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

    const appResult = await pool.query(
      `SELECT u.name
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, user_id]
    );

    const universityName = appResult.rows[0]?.name || `Application #${id}`;

    await logActivity(
      user_id,
      "updated",
      "application",
      `${universityName} (${status})`
    );

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateApplicationChecklist(req, res) {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    const user_id = 1;

    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: "checklist must be an array" });
    }

    const result = await pool.query(
      `UPDATE applications
       SET checklist = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [JSON.stringify(checklist), id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found (or not yours)" });
    }

    const appResult = await pool.query(
      `SELECT u.name
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, user_id]
    );

    const universityName = appResult.rows[0]?.name || `Application #${id}`;

    await logActivity(user_id, "updated", "checklist", universityName);

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

async function deleteApplication(req, res) {
  try {
    const { id } = req.params;
    const user_id = 1;

    const result = await pool.query(
      `DELETE FROM applications
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found (or not yours)" });
    }

    let deletedUniversityName = `Application #${id}`;

    if (result.rows[0]?.university_id) {
      const universityResult = await pool.query(
        `SELECT name FROM universities WHERE id = $1`,
        [result.rows[0].university_id]
      );

      deletedUniversityName =
        universityResult.rows[0]?.name || deletedUniversityName;
    }

    await logActivity(user_id, "deleted", "application", deletedUniversityName);

    return res.json({ deleted: true, application: result.rows[0] });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
  updateApplicationChecklist,
  deleteApplication,
};