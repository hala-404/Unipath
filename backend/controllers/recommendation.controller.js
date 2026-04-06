const pool = require("../db/pool");
const { getAuth } = require("@clerk/express");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

async function getRecommendations(req, res) {
  try {
    const { userId: clerkUserId, sessionClaims } = getAuth(req);
    const email = sessionClaims?.email || sessionClaims?.email_address || null;
    const localUser = await ensureLocalUser(pool, clerkUserId, email);
    const user_id = localUser.id;

    let { gpa, city, program, language } = req.query;

    // Load saved profile
    const profileRes = await pool.query(
      `SELECT gpa, preferred_city, preferred_program, preferred_language
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = profileRes.rows[0];

    if (!gpa) gpa = profile.gpa;
    if (!city) city = profile.preferred_city;
    if (!program) program = profile.preferred_program;
    if (!language) language = profile.preferred_language;

    const userGpa =
      gpa !== null && gpa !== undefined && gpa !== ""
        ? Number(gpa)
        : null;

    const result = await pool.query("SELECT * FROM universities");
    const universities = result.rows;

    // -------------------------
    // 1. Exact matches
    // -------------------------
    let exactMatches = universities;

    if (city && city !== "") {
      exactMatches = exactMatches.filter((u) =>
        u.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (program && program !== "") {
      exactMatches = exactMatches.filter((u) =>
        u.program.toLowerCase().includes(program.toLowerCase())
      );
    }

    if (language && language !== "") {
      exactMatches = exactMatches.filter((u) =>
        u.language.toLowerCase().includes(language.toLowerCase())
      );
    }

    exactMatches = exactMatches
      .map((u) => {
        let score = 0;

        if (userGpa !== null && Number(u.min_gpa) <= userGpa) {
          score += 2;
        }

        if (city && u.city.toLowerCase().includes(city.toLowerCase())) {
          score += 1;
        }

        if (program && u.program.toLowerCase().includes(program.toLowerCase())) {
          score += 1;
        }

        if (language && u.language.toLowerCase().includes(language.toLowerCase())) {
          score += 1;
        }

        return { ...u, score };
      })
      .sort((a, b) => b.score - a.score);

    // -------------------------
    // 2. Alternative recommendations
    // -------------------------
    let alternativeRecommendations = universities
      .map((u) => {
        let score = 0;

        if (userGpa !== null && Number(u.min_gpa) <= userGpa) score += 2;
        if (city && u.city.toLowerCase().includes(String(city).toLowerCase())) score += 1;
        if (program && u.program.toLowerCase().includes(String(program).toLowerCase())) score += 1;
        if (language && u.language.toLowerCase().includes(String(language).toLowerCase())) score += 1;

        return { ...u, score };
      })
      .filter((u) => u.score > 0);

    // Remove universities already in exactMatches
    const exactIds = new Set(exactMatches.map((u) => u.id));
    alternativeRecommendations = alternativeRecommendations
      .filter((u) => !exactIds.has(u.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return res.json({
      exactMatches,
      alternativeRecommendations,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getRecommendations };