const pool = require("../db/pool");

function buildDefaultChecklist() {
  return [
    {
      id: "cv",
      label: "CV",
      done: false,
      priority: "high",
    },
    {
      id: "personal_statement",
      label: "Personal Statement",
      done: false,
      priority: "high",
    },
    {
      id: "passport",
      label: "Passport",
      done: false,
      priority: "high",
    },
    {
      id: "language_proficiency",
      label: "Language Proficiency Document",
      done: false,
      priority: "high",
    },
    {
      id: "transcript",
      label: "Transcript",
      done: false,
      priority: "high",
    },
    {
      id: "additional_certificates",
      label: "Additional Certificates",
      done: false,
      priority: "medium",
    },
    {
      id: "non_criminal_record",
      label: "Non-Criminal Record",
      done: false,
      priority: "medium",
    },
    {
      id: "medical_check",
      label: "Medical Check",
      done: false,
      priority: "medium",
    },
  ];
}

async function createApplication(req, res) {
  try {
    const { university_id, status } = req.body;
    const user_id = req.user.user_id;

    if (!university_id) {
      return res.status(400).json({ error: "university_id is required" });
    }

    const existing = await pool.query(
      `SELECT id FROM applications WHERE user_id = $1 AND university_id = $2`,
      [user_id, university_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Application already exists in tracker" });
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, university_id, status, checklist)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        user_id,
        university_id,
        status || "Not Started",
        JSON.stringify(buildDefaultChecklist()),
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function listApplications(req, res) {
  try {
    const user_id = req.user.user_id;

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
    return res.status(500).json({ error: err.message });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.user_id;

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

async function updateApplicationChecklist(req, res) {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    const user_id = req.user.user_id;

    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: "checklist must be an array" });
    }

    const result = await pool.query(
      `UPDATE applications
       SET checklist = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, checklist`,
      [JSON.stringify(checklist), id, user_id]
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
    const user_id = req.user.user_id;

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
  updateApplicationChecklist,
  deleteApplication,
};