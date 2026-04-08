const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

function calculateFitScore(university, userGpa, preferences) {
  let score = 0;

  // GPA component (40 points max)
  if (userGpa !== null) {
    const gpaDiff = userGpa - Number(university.min_gpa);
    if (gpaDiff >= 0.5) score += 40;
    else if (gpaDiff >= 0.3) score += 35;
    else if (gpaDiff >= 0.1) score += 28;
    else if (gpaDiff >= 0) score += 20;
    else if (gpaDiff >= -0.1) score += 10;
    else if (gpaDiff >= -0.3) score += 5;
  }

  // Program match (25 points)
  if (
    preferences.program &&
    university.program.toLowerCase().includes(preferences.program.toLowerCase())
  ) {
    score += 25;
  }

  // Language match (15 points)
  if (
    preferences.language &&
    university.language
      .toLowerCase()
      .includes(preferences.language.toLowerCase())
  ) {
    score += 15;
  }

  // City match (10 points)
  if (
    preferences.city &&
    university.city.toLowerCase().includes(preferences.city.toLowerCase())
  ) {
    score += 10;
  }

  // Acceptance rate factor (10 points)
  const rate = Number(university.acceptance_rate) || 50;
  if (rate >= 50) score += 10;
  else if (rate >= 30) score += 7;
  else if (rate >= 15) score += 4;
  else score += 1;

  return Math.min(score, 100);
}

function classifyRisk(university, userGpa) {
  const minGpa = Number(university.min_gpa);
  const acceptanceRate = Number(university.acceptance_rate) || 50;

  if (userGpa === null) return "Match";

  const gpaDiff = userGpa - minGpa;

  // Safe: GPA well above requirement AND reasonable acceptance rate
  if (gpaDiff >= 0.3 && acceptanceRate >= 35) return "Safe";
  if (gpaDiff >= 0.2 && acceptanceRate >= 50) return "Safe";

  // Reach: GPA below minimum OR very low acceptance with thin margin
  if (gpaDiff < 0) return "Reach";
  if (gpaDiff < 0.1 && acceptanceRate < 15) return "Reach";

  // Everything else is Match
  return "Match";
}

async function getRecommendations(req, res) {
  try {
    const localUser = await ensureLocalUser(pool, req);
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

    const preferences = { city, program, language };

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
        const risk = classifyRisk(u, userGpa);
        let fit_score = calculateFitScore(u, userGpa, preferences);

        // Cap Reach universities at 75%
        if (risk === "Reach") {
          fit_score = Math.min(fit_score, 75);
        }

        return {
          ...u,
          fit_score,
          risk,
          score: fit_score,
          tuition_fee: u.tuition_fee,
          acceptance_rate: u.acceptance_rate,
          world_ranking: u.world_ranking,
          user_gpa: userGpa,
        };
      })
      .sort((a, b) => b.fit_score - a.fit_score);

    // -------------------------
    // 2. Alternative recommendations
    // -------------------------
    const exactIds = new Set(exactMatches.map((u) => u.id));

    let alternativeRecommendations = universities
      .filter((u) => !exactIds.has(u.id))
      .map((u) => {
        const risk = classifyRisk(u, userGpa);
        let fit_score = calculateFitScore(u, userGpa, preferences);

        // Cap Reach universities at 75%
        if (risk === "Reach") {
          fit_score = Math.min(fit_score, 75);
        }

        return {
          ...u,
          fit_score,
          risk,
          score: fit_score,
          tuition_fee: u.tuition_fee,
          acceptance_rate: u.acceptance_rate,
          world_ranking: u.world_ranking,
          user_gpa: userGpa,
        };
      })
      .filter((u) => u.fit_score > 0)
      .sort((a, b) => b.fit_score - a.fit_score)
      .slice(0, 10);

    return res.json({
      exactMatches,
      alternativeRecommendations,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getRecommendations };
