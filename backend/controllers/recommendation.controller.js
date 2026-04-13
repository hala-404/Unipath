const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function textMatches(universityValue, preferredValue) {
  const pref = normalizeText(preferredValue);
  if (!pref) return true;

  const uni = normalizeText(universityValue);
  return uni.includes(pref) || pref.includes(uni);
}

function isAnyProfile(profile) {
  const noGpa = profile.gpa == null || profile.gpa === "";
  const noCity = !String(profile.preferred_city || "").trim();
  const noCountry = !String(profile.preferred_country || "").trim();
  const noProgram = !String(profile.preferred_program || "").trim();
  const noLanguage = !String(profile.preferred_language || "").trim();
  const noBudget = profile.max_tuition == null || profile.max_tuition === "";

  return noGpa && noCity && noCountry && noProgram && noLanguage && noBudget;
}

function locationMatches(university, profile) {
  const preferredCity = normalizeText(profile.preferred_city);
  const preferredCountry = normalizeText(profile.preferred_country);

  const uniCity = normalizeText(university.city);
  const uniCountry = normalizeText(university.country);

  if (!preferredCity && !preferredCountry) {
    return true;
  }

  if (preferredCity && preferredCity === uniCity) {
    return true;
  }

  if (preferredCountry && preferredCountry === uniCountry) {
    return true;
  }

  return false;
}

function hasReason(university, keyword) {
  return (university.reasons || []).some((reason) =>
    reason.toLowerCase().includes(keyword)
  );
}

function computeRecommendation(university, profile) {
  const hasUserGpa = profile.gpa !== null && profile.gpa !== undefined && profile.gpa !== "";
  const userGpa = hasUserGpa ? Number(profile.gpa) : null;
  const minGpa = Number(university.min_gpa);

  if (hasUserGpa && !Number.isNaN(userGpa) && !Number.isNaN(minGpa) && userGpa < minGpa) {
    return null;
  }

  let matched = 0;
  let total = 0;
  const reasons = [];

  // location: city OR country
  const preferredCity = normalizeText(profile.preferred_city);
  const preferredCountry = normalizeText(profile.preferred_country);
  const uniCity = normalizeText(university.city);
  const uniCountry = normalizeText(university.country);

  if (preferredCity || preferredCountry) {
    total += 1;

    if (
      (preferredCity && preferredCity === uniCity) ||
      (preferredCountry && preferredCountry === uniCountry)
    ) {
      matched += 1;
      reasons.push(
        preferredCity && preferredCity === uniCity
          ? `Matches your preferred city: ${university.city}`
          : `Matches your preferred country: ${university.country}`
      );
    }
  }

  // program
  const preferredProgram = normalizeText(profile.preferred_program);
  const uniProgram = normalizeText(university.program);

  if (preferredProgram) {
    total += 1;
    if (uniProgram.includes(preferredProgram) || preferredProgram.includes(uniProgram)) {
      matched += 1;
      reasons.push(`Matches your preferred program: ${university.program}`);
    }
  }

  // language
  const preferredLanguage = normalizeText(profile.preferred_language);
  const uniLanguage = normalizeText(university.language);

  if (preferredLanguage) {
    total += 1;
    if (preferredLanguage === uniLanguage) {
      matched += 1;
      reasons.push(`Matches your preferred language: ${university.language}`);
    }
  }

  // budget
  const maxTuition = Number(profile.max_tuition);
  const uniTuition = Number(university.tuition_fee);

  if (!Number.isNaN(maxTuition) && maxTuition > 0 && !Number.isNaN(uniTuition)) {
    total += 1;
    if (uniTuition <= maxTuition) {
      matched += 1;
      reasons.push(`Tuition is within your budget: $${uniTuition.toLocaleString()}`);
    }
  }

  // GPA reason
  if (hasUserGpa && !Number.isNaN(userGpa) && !Number.isNaN(minGpa)) {
    reasons.unshift(`Your GPA of ${userGpa} meets the minimum GPA of ${minGpa}`);
  }

  const fit_score = total === 0 ? 100 : Math.round((matched / total) * 100);

  let risk = "Match";
  if (hasUserGpa && !Number.isNaN(userGpa) && !Number.isNaN(minGpa)) {
    const gap = userGpa - minGpa;
    if (gap >= 0.4) risk = "Safe";
    else if (gap < 0.1) risk = "Reach";
  }

  return {
    ...university,
    user_gpa: profile.gpa,
    fit_score,
    risk,
    reasons,
    matchedCriteria: matched,
    totalCriteria: total,
  };
}

async function getRecommendations(req, res) {
  try {
    const localUser = await ensureLocalUser(pool, req);
    const user_id = localUser.id;

    const profileRes = await pool.query(
      `SELECT
         gpa,
         preferred_city,
         preferred_country,
         preferred_program,
         preferred_language,
         max_tuition
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile = profileRes.rows[0];

    const universityRes = await pool.query(`
      SELECT
        id,
        name,
        city,
        country,
        program,
        language,
        min_gpa,
        tuition_fee,
        deadline,
        acceptance_rate,
        world_ranking,
        website_url,
        image_url
      FROM universities
    `);

    const evaluated = universityRes.rows
      .map((uni) => computeRecommendation(uni, profile))
      .filter(Boolean)
      .sort((a, b) => {
        if (b.fit_score !== a.fit_score) return b.fit_score - a.fit_score;
        return (a.world_ranking ?? 999999) - (b.world_ranking ?? 999999);
      });

    const anyProfile = isAnyProfile(profile);

    let exactMatches = [];
    let alternativeRecommendations = [];

    if (anyProfile) {
      exactMatches = evaluated;
      alternativeRecommendations = [];
    } else {
      exactMatches = evaluated.filter((u) => {
        const programOk = textMatches(u.program, profile.preferred_program);
        const languageOk =
          !profile.preferred_language ||
          normalizeText(u.language) === normalizeText(profile.preferred_language);
        const locationOk = locationMatches(u, profile);

        return programOk && languageOk && locationOk;
      });

      alternativeRecommendations = evaluated.filter((u) => {
        const programOk = textMatches(u.program, profile.preferred_program);
        const languageOk =
          !profile.preferred_language ||
          normalizeText(u.language) === normalizeText(profile.preferred_language);
        const locationOk = locationMatches(u, profile);

        return programOk && languageOk && !locationOk;
      });
    }

    return res.json({
      profileSummary: {
        gpa: profile.gpa,
        preferred_city: profile.preferred_city,
        preferred_country: profile.preferred_country,
        preferred_program: profile.preferred_program,
        preferred_language: profile.preferred_language,
        max_tuition: profile.max_tuition,
      },
      exactMatches,
      alternativeRecommendations,
    });
  } catch (err) {
    throw err;
  }
}

module.exports = { getRecommendations };
