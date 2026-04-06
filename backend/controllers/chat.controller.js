const axios = require("axios");
const pool = require("../db/pool");
const { getAuth } = require("@clerk/express");
const { ensureLocalUser } = require("../utils/ensureLocalUser");

async function callOpenRouter(messages) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "meta-llama/llama-3-8b-instruct",
      messages,
      temperature: 0.3, // Slightly higher for more natural responses
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeText(text = "") {
  return text.toLowerCase().trim();
}

function messageHasAny(message, keywords) {
  const lower = normalizeText(message);
  return keywords.some((word) => lower.includes(word));
}

/**
 * Check if user is asking for alternatives/different options
 */
function wantsAlternatives(message) {
  const lower = normalizeText(message);
  const alternativeKeywords = [
    "another", "other", "different", "else", "alternative",
    "more options", "what else", "something else", "besides",
    "instead", "not that", "give me more", "any other"
  ];
  return alternativeKeywords.some((kw) => lower.includes(kw));
}

/**
 * Extract majors that have already been mentioned in conversation history
 */
function extractMentionedMajors(history, availableMajors) {
  const mentioned = new Set();
  const allText = history
    .map((msg) => msg.content || "")
    .join(" ")
    .toLowerCase();

  availableMajors.forEach((major) => {
    if (allText.includes(major.toLowerCase())) {
      mentioned.add(major);
    }
  });

  return Array.from(mentioned);
}

/**
 * Extract user interests from entire conversation history
 */
function extractInterestsFromHistory(history) {
  const allText = history
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content || "")
    .join(" ")
    .toLowerCase();

  const interests = [];

  if (messageHasAny(allText, ["math", "mathematics", "statistics", "analysis", "numbers"])) {
    interests.push("math");
  }
  if (messageHasAny(allText, ["coding", "programming", "code", "developer", "software"])) {
    interests.push("coding");
  }
  if (messageHasAny(allText, ["business", "management", "finance", "marketing", "economics"])) {
    interests.push("business");
  }
  if (messageHasAny(allText, ["design", "creative", "art", "media", "visual"])) {
    interests.push("design");
  }
  if (messageHasAny(allText, ["biology", "health", "medical", "medicine", "science"])) {
    interests.push("health");
  }
  if (messageHasAny(allText, ["engineer", "engineering", "machines", "mechanical", "build"])) {
    interests.push("engineering");
  }
  if (messageHasAny(allText, ["data", "analytics", "ai", "machine learning"])) {
    interests.push("data");
  }

  return interests;
}

function scoreMajorsFromMessage(message, availableMajors, history = [], excludeMajors = []) {
  const lower = normalizeText(message);

  const majorScores = {};
  availableMajors.forEach((major) => {
    // Skip majors we want to exclude (already mentioned)
    if (excludeMajors.some((ex) => normalizeText(ex) === normalizeText(major))) {
      majorScores[major] = -100; // Negative score to exclude
    } else {
      majorScores[major] = 0;
    }
  });

  const boostIfExists = (majorName, points) => {
    const found = availableMajors.find(
      (m) => normalizeText(m) === normalizeText(majorName)
    );
    if (found && majorScores[found] >= 0) {
      majorScores[found] += points;
    }
  };

  // Check current message AND history for interests
  const interests = extractInterestsFromHistory([...history, { role: "user", content: message }]);

  if (interests.includes("math")) {
    boostIfExists("Data Science", 3);
    boostIfExists("Computer Science", 2);
    boostIfExists("Mathematics", 3);
    boostIfExists("Statistics", 3);
    boostIfExists("Business Analytics", 2);
    boostIfExists("Economics", 2);
    boostIfExists("Finance", 2);
    boostIfExists("Actuarial Science", 2);
  }

  if (interests.includes("coding")) {
    boostIfExists("Computer Science", 3);
    boostIfExists("Data Science", 2);
    boostIfExists("Software Engineering", 3);
    boostIfExists("Information Technology", 2);
    boostIfExists("Cybersecurity", 2);
  }

  if (interests.includes("business")) {
    boostIfExists("Business", 3);
    boostIfExists("Business Analytics", 2);
    boostIfExists("Marketing", 2);
    boostIfExists("Finance", 2);
    boostIfExists("Economics", 2);
    boostIfExists("Management", 2);
  }

  if (interests.includes("design")) {
    boostIfExists("Design", 3);
    boostIfExists("Graphic Design", 3);
    boostIfExists("UX Design", 3);
    boostIfExists("Architecture", 2);
    boostIfExists("Media Studies", 2);
  }

  if (interests.includes("health")) {
    boostIfExists("Biology", 3);
    boostIfExists("Public Health", 2);
    boostIfExists("Nursing", 2);
    boostIfExists("Medicine", 3);
    boostIfExists("Pharmacy", 2);
    boostIfExists("Psychology", 2);
  }

  if (interests.includes("engineering")) {
    boostIfExists("Engineering", 3);
    boostIfExists("Mechanical Engineering", 3);
    boostIfExists("Electrical Engineering", 3);
    boostIfExists("Civil Engineering", 2);
    boostIfExists("Computer Engineering", 2);
  }

  if (interests.includes("data")) {
    boostIfExists("Data Science", 3);
    boostIfExists("Business Analytics", 2);
    boostIfExists("Statistics", 2);
    boostIfExists("Computer Science", 2);
  }

  const sortedMajors = Object.entries(majorScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  return sortedMajors;
}

/**
 * Format AI response into clean, readable paragraphs
 * Forces line breaks every 2-3 sentences for readability
 */
function formatResponse(text) {
  if (!text) return "";

  let formatted = text;

  // Fix broken decimals like "3. 9"
  formatted = formatted.replace(/(\d)\.\s+(\d)/g, "$1.$2");

  // Protect decimals temporarily (3.9)
  formatted = formatted.replace(/(\d)\.(\d)/g, "$1<<<DOT>>>$2");

  // Split ONLY on sentence endings (. ? !)
  const sentences = formatted
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Group sentences (2 sentences per paragraph)
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }

  formatted = paragraphs.join("\n\n");

  // Restore decimals
  formatted = formatted.replace(/<<<DOT>>>/g, ".");

  // Clean spacing
  formatted = formatted.replace(/\n{3,}/g, "\n\n").trim();

  return formatted;
}

const chatWithAdvisor = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const { userId: clerkUserId, sessionClaims } = getAuth(req);
    const email = sessionClaims?.email || sessionClaims?.email_address || null;
    const localUser = await ensureLocalUser(pool, clerkUserId, email);
    const userId = localUser.id;

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
    const extractionPrompt = `
You are an information extraction assistant.

Available majors: ${availableMajorsText}

Convert the user's message into JSON only.

Return ONLY valid JSON.
Do not add explanation.
Do not use markdown.
Do not wrap in backticks.

Allowed schema:
{
  "intent": "university_search" | "deadline_question" | "general_guidance" | "major_guidance",
  "city": string or null,
  "city_mode": "exact" | "different_from_profile" | null,
  "program": string or null,
  "language": string or null,
  "wants_alternatives": boolean,
  "deadline_interest": boolean
}

Rules:
- If the user asks for another city, set "city_mode" to "different_from_profile"
- If the user mentions a city, set "city" to that city and "city_mode" to "exact"
- If the user mentions a program or major, extract it into "program"
- If the user mentions a language, extract it
- If the message is about deadlines, set "deadline_interest" to true
- If the message is asking about majors, suitable fields, another major, or best fit, use "major_guidance"
- If the message is asking for universities, options, or matches, use "university_search"
- If it is general advice, use "general_guidance"
`;

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

    // DEBUG: Log what majors are available and recommended
    console.log("=== DEBUG: Major Recommendation ===");
    console.log("Available majors in DB:", availableMajors);
    console.log("User wants alternatives:", userWantsAlternatives);
    console.log("Already mentioned majors:", alreadyMentionedMajors);
    console.log("Exclude list:", excludeList);
    console.log("Final recommended majors:", finalRecommendedMajors);
    console.log("===================================");

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

    const answerPrompt = `You are UniPath Assistant, a friendly and knowledgeable student advisor helping students find the right university and program.

  CONVERSATION BEHAVIOR RULES:

  - If the user says "yes", DO NOT repeat previous information
  - Instead, CONTINUE to the next logical step

  Examples:
  - If you just recommended a university → give application steps
  - If you just explained a program → give more detailed info (curriculum, process, requirements)
  - If you already gave details → move forward (next steps, tips, deadlines)

  - NEVER repeat the same recommendation unless the user asks again
  - NEVER ask the same question twice
  - Always move the conversation forward
  - Avoid repeating the same university or major multiple times
  - If the user says "yes", assume they want deeper or next-step information

STUDENT PROFILE:
- GPA: ${profile.gpa ?? "Not set"}
- Preferred city: ${profile.preferred_city ?? "Not set"}
- Preferred program: ${profile.preferred_program ?? "Not set"}
- Preferred language: ${profile.preferred_language ?? "Not set"}

USER REQUEST ANALYSIS:
${JSON.stringify(extracted, null, 2)}

USER WANTS ALTERNATIVES: ${userWantsAlternatives ? "YES - they asked for different/other options" : "NO"}

RECOMMENDED MAJORS:
${recommendedMajorsText}

AVAILABLE UNIVERSITIES (use ONLY these):
${universityList}

STRICT RULES:
1. ONLY mention majors from "RECOMMENDED MAJORS" section - do NOT invent others
2. ONLY mention universities from "AVAILABLE UNIVERSITIES" section
3. If the user asks for OTHER/DIFFERENT majors but you only have one to offer, APOLOGIZE and explain honestly that currently only limited programs are available, but more will be added soon
4. Never mention "database", "system", "retrieved", or "provided list"
5. Speak naturally like a helpful human advisor
6. DO NOT keep repeating the same major if the user asked for something different

RESPONSE FORMAT - THIS IS CRITICAL:
- Write in SHORT paragraphs (2-3 sentences each)
- Put a BLANK LINE between each paragraph
- Start with a brief friendly opening (1 sentence)
- Give your main advice in the middle paragraphs
- End with ONE helpful follow-up question

EXAMPLE WHEN USER ASKS FOR ALTERNATIVES BUT NONE AVAILABLE:
I understand you'd like to explore other options! Unfortunately, at the moment our platform primarily focuses on Data Science programs.

We're actively working on adding more programs like Computer Science, Business Analytics, and Statistics. These would be great fits for someone with your math background.

In the meantime, would you like me to show you the Data Science universities available, or would you prefer to check back later when we have more options?

NOW RESPOND TO THE USER'S MESSAGE:`;

    let reply = await callOpenRouter([
      { role: "system", content: answerPrompt },
      ...cleanedHistory,
      { role: "user", content: message },
    ]);

    // Apply formatting cleanup
    reply = formatResponse(reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Failed to get chatbot response.",
    });
  }
};

module.exports = { chatWithAdvisor };