const pool = require("../db/pool");

async function listUniversities(req, res) {
  try {
    const { gpa, city, program, language } = req.query;

    const conditions = [];
    const values = [];

    if (gpa) {
      values.push(Number(gpa));
      conditions.push(`min_gpa <= $${values.length}`);
    }

    if (city) {
      values.push(`%${city}%`);
      conditions.push(`city ILIKE $${values.length}`);
    }

    if (program) {
      values.push(`%${program}%`);
      conditions.push(`program ILIKE $${values.length}`);
    }

    if (language) {
      values.push(`%${language}%`);
      conditions.push(`language ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM universities ${whereClause} ORDER BY id ASC`;

    const result = await pool.query(sql, values);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { listUniversities };