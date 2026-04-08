const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

/**
 * Calculate weighted fit score for a university
 */
function calculateFitScore(user, uni) {
  const userGpa = Number(user.gpa) || 0;
  const minGpa = Number(uni.min_gpa || 4.0);
  
  // 1️⃣ GPA score relative to university min GPA (capped at 1)
  const gpaScore = Math.min(userGpa / minGpa, 1);

  // 2️⃣ Program match: exact = 1, partial = 0.7, else 0
  let programScore = 0;
  if (uni.program && user.preferred_program) {
    const uProg = uni.program.toLowerCase();
    const pProg = user.preferred_program.toLowerCase();
    if (uProg === pProg) programScore = 1;
    else if (uProg.includes(pProg) || pProg.includes(uProg)) programScore = 0.7;
  }

  // 3️⃣ Language match: exact = 1, partial = 0.8, else 0
  let languageScore = 0;
  if (uni.language && user.preferred_language) {
    const uLang = uni.language.toLowerCase();
    const pLang = user.preferred_language.toLowerCase();
    if (uLang === pLang) languageScore = 1;
    else if (uLang.includes(pLang) || pLang.includes(uLang)) languageScore = 0.8;
  }

  // 4️⃣ Acceptance rate factor (more selective = higher score)
  const acceptanceScore = 1 - (Number(uni.acceptance_rate) || 100) / 100;

  // 5️⃣ Weighted sum
  const weights = { gpa: 0.4, program: 0.25, language: 0.15, acceptance: 0.2 };
  const totalFit = gpaScore*weights.gpa + programScore*weights.program + languageScore*weights.language + acceptanceScore*weights.acceptance;

  return Math.round(totalFit*100);
}

/**
 * Classify Safe / Match / Reach based on GPA vs minGPA
 */
function classifyRisk(user, uni) {
  const diff = Number(user.gpa) - Number(uni.min_gpa);
  if (diff >= 0.4) return "Safe";
  if (diff >= 0) return "Match";
  return "Reach";
}

async function getRecommendations(req, res) {
  try {
    // 1️⃣ Authenticate user via Clerk + local DB
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;

    // 2️⃣ Load user profile
    const profileRes = await pool.query(
      `SELECT gpa, preferred_city, preferred_program, preferred_language
       FROM users WHERE id = $1`,
      [user_id]
    );
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const profile = profileRes.rows[0];

    // 3️⃣ Query universities
    const uniRes = await pool.query(
      `SELECT id, name, city, country, program, language, min_gpa, tuition, deadline,
              website_url, world_ranking, acceptance_rate, description
       FROM universities`
    );
    const universities = uniRes.rows;

    // 4️⃣ Compute fit_score and risk
    const scoredUniversities = universities.map(u => {
      const fit_score = calculateFitScore(profile, u);
      const risk = classifyRisk(profile, u);
      return {
        ...u,
        fit_score,
        risk,
        ranking: u.world_ranking !== null ? `#${u.world_ranking} World` : "#N/A"
      };
    });

    // 5️⃣ Exact matches: filter by city, program, language
    const { city, program, language } = req.query;
    const exactMatches = scoredUniversities.filter(u => {
      let cityMatch = true, programMatch = true, langMatch = true;
      if (city) cityMatch = u.city.toLowerCase().includes(city.toLowerCase());
      if (program) programMatch = u.program.toLowerCase().includes(program.toLowerCase());
      if (language) langMatch = u.language.toLowerCase().includes(language.toLowerCase());
      return cityMatch && programMatch && langMatch;
    }).sort((a,b) => b.fit_score - a.fit_score);

    // 6️⃣ Alternative recommendations (top 10)
    const alternativeRecommendations = scoredUniversities
      .filter(u => !exactMatches.some(ex => ex.id === u.id))
      .sort((a,b) => b.fit_score - a.fit_score)
      .slice(0,10);

    return res.json({ exactMatches, alternativeRecommendations });

  } catch (err) {
    console.error("Recommendations error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { getRecommendations };