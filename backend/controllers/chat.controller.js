const pool = require("../db/pool");
const { ensureLocalUser } = require("../utils/ensureLocalUser");
const { z } = require("zod");
const {
  safeJsonParse,
  normalizeText,
  messageHasAny,
  wantsAlternatives,
  extractMentionedMajors,
  extractInterestsFromHistory,
  scoreMajorsFromMessage,
  formatResponse,
} = require("../utils/chatHelpers");
const {
  buildExtractionPrompt,
  buildAnswerPrompt,
} = require("../services/chatPrompt");

async function resolveChatUserId(req) {
  const localUser = await ensureLocalUser(pool, req);
  return localUser.id;
}

const chatSchema = z.object({
  message: z.string().min(1),
});

async function callOpenRouter(messages) {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error("OPENROUTER_API_KEY is missing");
    err.status = 500;
    throw err;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages,
      temperature: 0.3,
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error("OpenRouter error:", rawText);
    const err = new Error("LLM provider request failed");
    err.status = response.status;
    err.details = rawText;
    throw err;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    const err = new Error("LLM provider returned invalid JSON");
    err.status = 502;
    err.details = rawText;
    throw err;
  }

  return data?.choices?.[0]?.message?.content || "";
}

const chatWithAdvisor = async (req, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Message is required." });
    }

    const { message } = parsed.data;
    const { history = [] } = req.body;

    const userId = await resolveChatUserId(req);

    // 1. Load saved user profile
    const profileResult = await pool.query(
      `
      SELECT gpa, preferred_city, preferred_program, preferred_language
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const profile = profileResult.rows[0] || {};

    // 2. Load available majors from universities table
    const majorsResult = await pool.query(`
      SELECT DISTINCT program
      FROM universities
      WHERE program IS NOT NULL
      ORDER BY program ASC
    `);

    const availableMajors = majorsResult.rows.map((row) => row.program);
    const availableMajorsText =
      availableMajors.length > 0
        ? availableMajors.join(", ")
        : "No majors available right now.";

    // 3. Ask AI to extract structured search filters
    const extractionPrompt = buildExtractionPrompt(availableMajorsText);

    const extractionRaw = await callOpenRouter([
      { role: "system", content: extractionPrompt },
      { role: "user", content: message },
    ]);

    const extracted = safeJsonParse(extractionRaw) || {
      intent: "general_guidance",
      city: null,
      city_mode: null,
      program: null,
      language: null,
      wants_alternatives: false,
      deadline_interest: false,
    };

    // Clean history early since we need it for major recommendations
    const cleanedHistory = history
      .filter(
        (msg) =>
          msg &&
          (msg.role === "user" || msg.role === "assistant") &&
          msg.content
      )
      .map((msg) => ({
        role: msg.role,
        content: String(msg.content),
      }));

    // 4. Major recommendation engine (BACKEND-CONTROLLED)
    // Check if user wants alternatives to previously mentioned majors
    const userWantsAlternatives = wantsAlternatives(message);
    const alreadyMentionedMajors = extractMentionedMajors(cleanedHistory, availableMajors);

    // If user wants alternatives, exclude already mentioned majors
    const excludeList = userWantsAlternatives ? alreadyMentionedMajors : [];

    const majorScores = scoreMajorsFromMessage(
      message,
      availableMajors,
      cleanedHistory,
      excludeList
    );
    let recommendedMajors = majorScores.slice(0, 3).map(([major]) => major);

    // If no recommendations found and user wants alternatives, provide random alternatives
    if (recommendedMajors.length === 0 && userWantsAlternatives) {
      const remainingMajors = availableMajors.filter(
        (m) => !alreadyMentionedMajors.some((ex) => normalizeText(ex) === normalizeText(m))
      );
      // Pick up to 3 random majors from remaining
      recommendedMajors = remainingMajors
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    }

    // If still no recommendations, try scoring without exclusions
    if (recommendedMajors.length === 0) {
      const fallbackScores = scoreMajorsFromMessage(message, availableMajors, cleanedHistory, []);
      recommendedMajors = fallbackScores.slice(0, 3).map(([major]) => major);
    }

    // If user already has a preferred program and we're not looking for alternatives, include it
    if (
      !userWantsAlternatives &&
      profile.preferred_program &&
      availableMajors.some(
        (m) => normalizeText(m) === normalizeText(profile.preferred_program)
      ) &&
      !recommendedMajors.some(
        (m) => normalizeText(m) === normalizeText(profile.preferred_program)
      )
    ) {
      recommendedMajors.unshift(profile.preferred_program);
    }

    const finalRecommendedMajors = [...new Set(recommendedMajors)].slice(0, 3);

    // Build recommended majors text - if empty, tell AI to be honest
    let recommendedMajorsText;
    if (finalRecommendedMajors.length > 0) {
      recommendedMajorsText = finalRecommendedMajors.map((m, i) => `${i + 1}. ${m}`).join("\n");
    } else if (userWantsAlternatives && availableMajors.length <= 1) {
      recommendedMajorsText = `IMPORTANT: The student wants alternative majors, but only "${availableMajors[0] || 'Data Science'}" is currently available in the system. Apologize and explain that more programs will be added soon.`;
    } else {
      recommendedMajorsText = "No suitable major recommendation is currently available.";
    }

    // 5. Merge profile defaults with extracted overrides for university search
    const finalGpa = profile.gpa ?? null;
    const finalProgram =
      extracted.program ||
      finalRecommendedMajors[0] ||
      profile.preferred_program ||
      null;
    const finalLanguage = extracted.language || profile.preferred_language || null;

    let universitiesQuery = `
      SELECT name, city, country, program, language, min_gpa, deadline
      FROM universities
      WHERE
        ($1::numeric IS NULL OR min_gpa <= $1)
        AND ($2::text IS NULL OR city ILIKE '%' || $2 || '%')
        AND ($3::text IS NULL OR program ILIKE '%' || $3 || '%')
        AND ($4::text IS NULL OR language ILIKE '%' || $4 || '%')
      ORDER BY deadline ASC NULLS LAST, min_gpa ASC, name ASC
      LIMIT 10
    `;

    let cityForSearch = extracted.city || profile.preferred_city || null;
    let queryParams = [finalGpa, cityForSearch, finalProgram, finalLanguage];

    if (extracted.city_mode === "different_from_profile") {
      universitiesQuery = `
        SELECT name, city, country, program, language, min_gpa, deadline
        FROM universities
        WHERE
          ($1::numeric IS NULL OR min_gpa <= $1)
          AND ($2::text IS NULL OR city NOT ILIKE '%' || $2 || '%')
          AND ($3::text IS NULL OR program ILIKE '%' || $3 || '%')
          AND ($4::text IS NULL OR language ILIKE '%' || $4 || '%')
        ORDER BY deadline ASC NULLS LAST, min_gpa ASC, name ASC
        LIMIT 10
      `;

      queryParams = [
        finalGpa,
        profile.preferred_city || null,
        finalProgram,
        finalLanguage,
      ];
    }

    const universitiesResult = await pool.query(universitiesQuery, queryParams);
    const universities = universitiesResult.rows;

    const universityList =
      universities.length > 0
        ? universities
            .map((uni, index) => {
              return `${index + 1}. ${uni.name} | ${uni.city}, ${uni.country} | Program: ${uni.program} | Language: ${uni.language} | Min GPA: ${uni.min_gpa} | Deadline: ${uni.deadline}`;
            })
            .join("\n")
        : "No matching university options are currently available.";

    // 6. Final AI explanation - IMPROVED PROMPT

    const answerPrompt = buildAnswerPrompt({
      profile,
      extracted,
      userWantsAlternatives,
      recommendedMajorsText,
      universityList,
    });

    let reply = await callOpenRouter([
      { role: "system", content: answerPrompt },
      ...cleanedHistory,
      { role: "user", content: message },
    ]);

    // Apply formatting cleanup
    reply = formatResponse(reply);

    return res.status(200).json({ reply });
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({
        error: error.message || "Chat request failed",
        details: error.details,
      });
    }

    throw error;
  }
};

const getChatSuggestions = async (req, res) => {
  try {
    const user_id = await resolveChatUserId(req);

    const profileResult = await pool.query(
      `SELECT preferred_program, preferred_city, preferred_country
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    const applicationsResult = await pool.query(
      `SELECT
         a.id AS application_id,
         a.status,
         u.name,
         u.program,
         u.city
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.user_id = $1
       ORDER BY a.id DESC`,
      [user_id]
    );

    const profile = profileResult.rows[0] || {};
    const applications = applicationsResult.rows || [];
    const suggestions = [];

    if (profile.preferred_program && profile.preferred_city) {
      suggestions.push(
        `Recommend universities for ${profile.preferred_program} in ${profile.preferred_city}`
      );
    } else if (profile.preferred_program) {
      suggestions.push(
        `Recommend universities for ${profile.preferred_program}`
      );
    } else {
      suggestions.push("Recommend universities for my profile");
    }

    if (applications.length >= 2) {
      suggestions.push(
        `Compare ${applications[0].name} and ${applications[1].name} for me`
      );
    } else if (applications.length === 1) {
      suggestions.push(`What are my chances at ${applications[0].name}?`);
    }

    const notStarted = applications.find((app) => app.status === "Not Started");
    if (notStarted) {
      suggestions.push(`What should I prepare first for ${notStarted.name}?`);
    }

    const inProgress = applications.find((app) => app.status === "In Progress");
    if (inProgress) {
      suggestions.push(
        `What should I finish next for my ${inProgress.name} application?`
      );
    }

    const finalSuggestions = [...new Set(suggestions)].slice(0, 4);

    return res.json({ suggestions: finalSuggestions });
  } catch (err) {
    throw err;
  }
};

module.exports = { chatWithAdvisor, getChatSuggestions };