const pool = require("../db/pool");

// ── Risk classification based on GPA gap ──
function classifyRisk(userGpa, minGpa, acceptanceRate) {
  if (userGpa === null) return { label: "Unknown", color: "slate" };

  const gpaGap = userGpa - minGpa;

  if (gpaGap >= 0.3) return { label: "Safe", color: "green" };
  if (gpaGap >= 0.0) return { label: "Match", color: "amber" };
  return { label: "Reach", color: "red" };
}

// ── Weighted fit score (0–100) with breakdown ──
function computeFitScore(university, userGpa, city, program, language) {
  const weights = { gpa: 40, program: 25, city: 20, language: 15 };
  const breakdown = { gpa: 0, program: 0, city: 0, language: 0 };
  const reasons = [];

  // GPA match (40%)
  if (userGpa !== null) {
    const gap = userGpa - Number(university.min_gpa);
    if (gap >= 0.3) {
      breakdown.gpa = weights.gpa;
      reasons.push(`GPA exceeds minimum by ${gap.toFixed(1)}`);
    } else if (gap >= 0) {
      breakdown.gpa = Math.round(weights.gpa * 0.7);
      reasons.push(`GPA meets minimum (close match)`);
    } else {
      breakdown.gpa = Math.round(weights.gpa * 0.3);
      reasons.push(`GPA is ${Math.abs(gap).toFixed(1)} below minimum`);
    }
  }

  // Program match (25%)
  if (program && program !== "") {
    if (university.program.toLowerCase().includes(program.toLowerCase())) {
      breakdown.program = weights.program;
      reasons.push(`Program matches your preference`);
    }
  }

  // City match (20%)
  if (city && city !== "") {
    if (university.city.toLowerCase().includes(city.toLowerCase())) {
      breakdown.city = weights.city;
      reasons.push(`Located in your preferred city`);
    }
  }

  // Language match (15%)
  if (language && language !== "") {
    if (university.language.toLowerCase().includes(language.toLowerCase())) {
      breakdown.language = weights.language;
      reasons.push(`Teaches in your preferred language`);
    }
  }

  const total = breakdown.gpa + breakdown.program + breakdown.city + breakdown.language;

  return { score: total, breakdown, reasons };
}

async function getRecommendations(req, res) {
  try {
    const user_id = req.user.user_id;
    let { gpa, city, program, language } = req.query;

    // Load saved profile
    const profileRes = await pool.query(
      `SELECT gpa, preferred_city, preferred_program, preferred_language
       FROM users WHERE id = $1`,
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

    // ── 1. Exact matches (all filters match) ──
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
        const fit = computeFitScore(u, userGpa, city, program, language);
        const risk = classifyRisk(userGpa, Number(u.min_gpa), u.acceptance_rate);

        return {
          ...u,
          score: fit.score,
          fit_breakdown: fit.breakdown,
          fit_reasons: fit.reasons,
          risk_label: risk.label,
          risk_color: risk.color,
        };
      })
      .sort((a, b) => b.score - a.score);

    // ── 2. Alternative recommendations ──
    const exactIds = new Set(exactMatches.map((u) => u.id));

    let alternativeRecommendations = universities
      .filter((u) => !exactIds.has(u.id))
      .map((u) => {
        const fit = computeFitScore(u, userGpa, city, program, language);
        const risk = classifyRisk(userGpa, Number(u.min_gpa), u.acceptance_rate);

        return {
          ...u,
          score: fit.score,
          fit_breakdown: fit.breakdown,
          fit_reasons: fit.reasons,
          risk_label: risk.label,
          risk_color: risk.color,
        };
      })
      .filter((u) => u.score > 0)
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