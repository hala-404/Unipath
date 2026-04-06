/**
 * UniPath Action-Based Chat Controller
 * 
 * Instead of a form-filling state machine, this uses an AI agent that:
 * 1. Understands user intent
 * 2. Decides which action(s) to take
 * 3. Executes actions against the database
 * 4. Formats a natural response
 */

const axios = require("axios");
const pool = require("../db/pool");

// ============================================
// AI MODEL CONFIGURATION
// ============================================

async function callAI(messages, jsonMode = false) {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "meta-llama/llama-3-8b-instruct",
      messages,
      temperature: jsonMode ? 0.1 : 0.4,
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

// ============================================
// ACTION DEFINITIONS
// ============================================

const ACTIONS = {
  // Search for universities with filters
  SEARCH_UNIVERSITIES: "search_universities",
  
  // Get recommendations based on user profile
  GET_RECOMMENDATIONS: "get_recommendations",
  
  // Compare universities or locations
  COMPARE: "compare",
  
  // Get deadline information
  CHECK_DEADLINES: "check_deadlines",
  
  // Update user preferences
  UPDATE_PREFERENCES: "update_preferences",
  
  // Add university to tracker
  ADD_TO_TRACKER: "add_to_tracker",
  
  // Remove from tracker
  REMOVE_FROM_TRACKER: "remove_from_tracker",
  
  // Get tracker status
  GET_TRACKER: "get_tracker",
  
  // General advice/guidance
  GIVE_ADVICE: "give_advice",
  
  // Explain/describe something
  EXPLAIN: "explain",
  
  // Greeting or casual conversation
  CHAT: "chat",
};

// ============================================
// INTENT DETECTION
// ============================================

async function detectIntent(message, profile, history) {
  const prompt = `You are an intent classifier for a university application assistant.

USER PROFILE:
- GPA: ${profile.gpa ?? "Not set"}
- Preferred City: ${profile.preferred_city ?? "Not set"}
- Preferred Program: ${profile.preferred_program ?? "Not set"}
- Preferred Language: ${profile.preferred_language ?? "Not set"}

AVAILABLE ACTIONS:
1. search_universities - Find universities matching criteria (city, country, program, language, gpa)
2. get_recommendations - Get personalized recommendations based on profile
3. compare - Compare universities, cities, or countries
4. check_deadlines - Find upcoming deadlines
5. update_preferences - Change user's saved preferences (gpa, city, program, language)
6. add_to_tracker - Add a university to application tracker
7. remove_from_tracker - Remove from tracker
8. get_tracker - Show current tracker status
9. give_advice - Provide application guidance, tips, strategy
10. explain - Explain a concept, requirement, or process
11. chat - Greeting, casual conversation, or unclear intent

Analyze the user's message and extract:
1. Primary action (one of the above)
2. Parameters needed for that action
3. Any secondary actions if the message implies multiple things

RESPOND WITH JSON ONLY:
{
  "primary_action": "action_name",
  "parameters": {
    "gpa": number or null,
    "program": "string or null",
    "city": "string or null",
    "country": "string or null",
    "language": "string or null",
    "university_name": "string or null",
    "compare_items": ["item1", "item2"] or null,
    "compare_type": "universities|cities|countries|programs" or null,
    "advice_topic": "string or null",
    "explain_topic": "string or null",
    "deadline_filter": "upcoming|this_month|this_week" or null,
    "update_field": "gpa|city|program|language" or null,
    "update_value": "value" or null,
    "limit": number or null
  },
  "secondary_actions": [],
  "confidence": 0.0-1.0,
  "needs_clarification": false,
  "clarification_question": null
}

RECENT CONVERSATION:
${history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

USER MESSAGE: "${message}"

Return ONLY valid JSON, no explanation.`;

  const response = await callAI([{ role: "system", content: prompt }], true);
  
  try {
    // Clean response - remove any markdown code blocks
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Intent parse error:", e.message, "Response:", response);
    return {
      primary_action: "chat",
      parameters: {},
      confidence: 0.5,
      needs_clarification: false
    };
  }
}

// ============================================
// ACTION HANDLERS
// ============================================

async function executeAction(action, params, profile, userId) {
  switch (action) {
    case ACTIONS.SEARCH_UNIVERSITIES:
      return await searchUniversities(params, profile);
    
    case ACTIONS.GET_RECOMMENDATIONS:
      return await getRecommendations(params, profile);
    
    case ACTIONS.COMPARE:
      return await compareItems(params, profile);
    
    case ACTIONS.CHECK_DEADLINES:
      return await checkDeadlines(params, profile);
    
    case ACTIONS.UPDATE_PREFERENCES:
      return await updatePreferences(params, userId);
    
    case ACTIONS.ADD_TO_TRACKER:
      return await addToTracker(params, userId);
    
    case ACTIONS.REMOVE_FROM_TRACKER:
      return await removeFromTracker(params, userId);
    
    case ACTIONS.GET_TRACKER:
      return await getTracker(userId);
    
    case ACTIONS.GIVE_ADVICE:
      return { type: "advice", topic: params.advice_topic };
    
    case ACTIONS.EXPLAIN:
      return { type: "explain", topic: params.explain_topic };
    
    case ACTIONS.CHAT:
    default:
      return { type: "chat" };
  }
}

// ============================================
// DATABASE ACTIONS
// ============================================

async function searchUniversities(params, profile) {
  try {
    // Safely handle params and profile
    const safeParams = params || {};
    const safeProfile = profile || {};
    
    const conditions = ["deadline >= CURRENT_DATE"];
    const values = [];
    let idx = 1;

    // Use provided params or fall back to profile
    const gpa = safeParams.gpa ?? safeProfile.gpa ?? null;
    const city = safeParams.city ?? null;
    const country = safeParams.country ?? null;
    const program = safeParams.program ?? null;
    const language = safeParams.language ?? null;
    const limit = safeParams.limit ?? 10;

    if (gpa) {
      conditions.push(`min_gpa <= $${idx}`);
      values.push(gpa);
      idx++;
    }

    if (city) {
      conditions.push(`city ILIKE $${idx}`);
      values.push(`%${city}%`);
      idx++;
    }

    if (country) {
      conditions.push(`country ILIKE $${idx}`);
      values.push(`%${country}%`);
      idx++;
    }

    if (program) {
      conditions.push(`program ILIKE $${idx}`);
      values.push(`%${program}%`);
      idx++;
    }

    if (language) {
      conditions.push(`language ILIKE $${idx}`);
      values.push(`%${language}%`);
      idx++;
    }

    const sql = `
      SELECT id, name, city, country, program, language, min_gpa, deadline
      FROM universities
      WHERE ${conditions.join(" AND ")}
      ORDER BY deadline ASC
      LIMIT ${limit}
    `;

    const result = await pool.query(sql, values);
    
    return {
      type: "universities",
      data: result.rows,
      filters_used: { gpa, city, country, program, language },
      total: result.rows.length,
      message: result.rows.length > 0 
        ? `Found ${result.rows.length} universities`
        : "No universities found matching your criteria"
    };
  } catch (err) {
    console.error("Search universities error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

async function getRecommendations(params, profile) {
  try {
    // Safely handle params and profile
    const safeParams = params || {};
    const safeProfile = profile || {};
    
    // Get all universities and score them
    const result = await pool.query(`
      SELECT * FROM universities 
      WHERE deadline >= CURRENT_DATE
      ORDER BY deadline ASC
    `);

    const userGpa = safeParams.gpa ?? safeProfile.gpa ?? null;
    const city = safeParams.city ?? safeProfile.preferred_city ?? null;
    const program = safeParams.program ?? safeProfile.preferred_program ?? null;
    const language = safeParams.language ?? safeProfile.preferred_language ?? null;

  const scored = result.rows.map(uni => {
    let score = 0;
    const reasons = [];

    // GPA fit (40 points max)
    if (userGpa) {
      const gap = userGpa - Number(uni.min_gpa);
      if (gap >= 0.3) {
        score += 40;
        reasons.push(`Your GPA exceeds minimum by ${gap.toFixed(1)}`);
      } else if (gap >= 0) {
        score += 28;
        reasons.push("GPA meets minimum requirement");
      } else {
        score += 10;
        reasons.push(`GPA is ${Math.abs(gap).toFixed(1)} below minimum (reach school)`);
      }
    }

    // Program match (25 points)
    if (program && uni.program.toLowerCase().includes(program.toLowerCase())) {
      score += 25;
      reasons.push("Matches your preferred program");
    }

    // City match (20 points)
    if (city && uni.city.toLowerCase().includes(city.toLowerCase())) {
      score += 20;
      reasons.push("Located in your preferred city");
    }

    // Language match (15 points)
    if (language && uni.language.toLowerCase().includes(language.toLowerCase())) {
      score += 15;
      reasons.push("Taught in your preferred language");
    }

    // Risk classification
    let risk = "Unknown";
    if (userGpa) {
      const gap = userGpa - Number(uni.min_gpa);
      if (gap >= 0.5) risk = "Safe";
      else if (gap >= 0) risk = "Match";
      else risk = "Reach";
    }

    return { ...uni, score, reasons, risk };
  });

  // Sort by score and return top results
  scored.sort((a, b) => b.score - a.score);

    const topResults = scored.slice(0, safeParams.limit ?? 10);
    
    return {
      type: "recommendations",
      data: topResults,
      profile_used: { gpa: userGpa, city, program, language },
      total: topResults.length,
      message: topResults.length > 0 
        ? `Found ${topResults.length} personalized recommendations`
        : "No recommendations found. Try updating your profile preferences."
    };
  } catch (err) {
    console.error("Get recommendations error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

async function compareItems(params, profile) {
  try {
    const safeParams = params || {};
    const items = safeParams.compare_items || [];
    const compareType = safeParams.compare_type || "universities";

    if (items.length < 2) {
      return { type: "error", message: "Need at least 2 items to compare. Please specify what you'd like to compare." };
    }

    if (compareType === "universities") {
      const result = await pool.query(
        `SELECT * FROM universities WHERE name ILIKE ANY($1)`,
        [items.map(i => `%${i}%`)]
      );
      return { type: "comparison", compareType, data: result.rows, items };
    }

    if (compareType === "cities" || compareType === "countries") {
      const field = compareType === "cities" ? "city" : "country";
      const results = {};
      
      for (const item of items) {
        const result = await pool.query(
          `SELECT program, COUNT(*) as count, MIN(min_gpa) as min_gpa_required, 
                  MIN(deadline) as earliest_deadline
           FROM universities 
           WHERE ${field} ILIKE $1 AND deadline >= CURRENT_DATE
           GROUP BY program`,
          [`%${item}%`]
        );
        results[item] = result.rows;
      }
      
      return { type: "comparison", compareType, data: results, items };
    }

    return { type: "error", message: "Unknown comparison type" };
  } catch (err) {
    console.error("Compare items error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

async function checkDeadlines(params, profile) {
  try {
    // Safely handle params
    const safeParams = params || {};
    const safeProfile = profile || {};
    
    let dateFilter = "";

    if (safeParams.deadline_filter === "this_week") {
      dateFilter = "AND deadline <= CURRENT_DATE + INTERVAL '7 days'";
    } else if (safeParams.deadline_filter === "this_month") {
      dateFilter = "AND deadline <= CURRENT_DATE + INTERVAL '30 days'";
    }

    // Build query
    const conditions = ["deadline >= CURRENT_DATE"];
    const values = [];
    let idx = 1;

    if (safeProfile.gpa) {
      conditions.push(`min_gpa <= $${idx}`);
      values.push(safeProfile.gpa);
      idx++;
    }

    const sql = `
      SELECT name, city, country, program, language, min_gpa, deadline,
             (deadline - CURRENT_DATE) as days_left
      FROM universities
      WHERE ${conditions.join(" AND ")} ${dateFilter}
      ORDER BY deadline ASC
      LIMIT 15
    `;

    const result = await pool.query(sql, values);

    return {
      type: "deadlines",
      data: result.rows,
      total: result.rows.length,
      filter: safeParams.deadline_filter || "upcoming",
      message: result.rows.length > 0 
        ? `Found ${result.rows.length} upcoming deadlines`
        : "No upcoming deadlines found matching your criteria"
    };
  } catch (err) {
    console.error("Check deadlines error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

async function updatePreferences(params, userId) {
  const field = params.update_field;
  const value = params.update_value;

  if (!field || value === undefined) {
    return { type: "error", message: "Missing field or value to update" };
  }

  const fieldMap = {
    gpa: "gpa",
    city: "preferred_city",
    program: "preferred_program",
    language: "preferred_language"
  };

  const dbField = fieldMap[field];
  if (!dbField) {
    return { type: "error", message: "Invalid preference field" };
  }

  await pool.query(
    `UPDATE users SET ${dbField} = $1 WHERE id = $2`,
    [value, userId]
  );

  return {
    type: "preference_updated",
    field,
    value,
    message: `Your ${field} preference has been updated to "${value}"`
  };
}

async function addToTracker(params, userId) {
  const universityName = params.university_name;
  
  if (!universityName) {
    return { type: "error", message: "Which university would you like to add?" };
  }

  try {
    // Find the university - try multiple matching strategies
    let uniResult = await pool.query(
      `SELECT id, name, city, country, program FROM universities WHERE name ILIKE $1 LIMIT 1`,
      [`%${universityName}%`]
    );

    // If no match, try matching individual words
    if (uniResult.rows.length === 0) {
      const words = universityName.split(' ').filter(w => w.length > 2);
      if (words.length > 0) {
        const wordPatterns = words.map(w => `%${w}%`).join('%');
        uniResult = await pool.query(
          `SELECT id, name, city, country, program FROM universities WHERE name ILIKE $1 LIMIT 1`,
          [wordPatterns]
        );
      }
    }

    if (uniResult.rows.length === 0) {
      // Return available universities as suggestions
      const suggestions = await pool.query(
        `SELECT DISTINCT name FROM universities ORDER BY name LIMIT 5`
      );
      return { 
        type: "error", 
        message: `Couldn't find a university matching "${universityName}". Some available universities: ${suggestions.rows.map(r => r.name).join(', ')}` 
      };
    }

    const uni = uniResult.rows[0];

    // Check if already tracked
    const existing = await pool.query(
      `SELECT id FROM applications WHERE user_id = $1 AND university_id = $2`,
      [userId, uni.id]
    );

    if (existing.rows.length > 0) {
      return { 
        type: "already_tracked", 
        university: uni.name,
        message: `${uni.name} is already in your tracker!`
      };
    }

    // Add to tracker (matching the actual table schema - no created_at, status is 'Not Started')
    await pool.query(
      `INSERT INTO applications (user_id, university_id, status)
       VALUES ($1, $2, $3)`,
      [userId, uni.id, 'Not Started']
    );

    return {
      type: "added_to_tracker",
      university: uni.name,
      program: uni.program,
      location: `${uni.city}, ${uni.country}`,
      message: `Added ${uni.name} (${uni.program}) to your application tracker!`
    };
  } catch (err) {
    console.error("Add to tracker error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

async function removeFromTracker(params, userId) {
  const universityName = params.university_name;
  
  if (!universityName) {
    return { type: "error", message: "Which university would you like to remove?" };
  }

  try {
    // First find the university
    const uniResult = await pool.query(
      `SELECT id, name FROM universities WHERE name ILIKE $1 LIMIT 1`,
      [`%${universityName}%`]
    );

    if (uniResult.rows.length === 0) {
      return { type: "error", message: `Couldn't find a university matching "${universityName}"` };
    }

    const uni = uniResult.rows[0];

    const result = await pool.query(
      `DELETE FROM applications 
       WHERE user_id = $1 AND university_id = $2
       RETURNING id`,
      [userId, uni.id]
    );

    if (result.rows.length === 0) {
      return { type: "error", message: `${uni.name} is not in your tracker` };
    }

    return {
      type: "removed_from_tracker",
      university: uni.name,
      message: `Removed ${uni.name} from your tracker`
    };
  } catch (err) {
    console.error("Remove from tracker error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

async function getTracker(userId) {
  try {
    const result = await pool.query(
      `SELECT 
         a.id as application_id,
         a.status,
         u.id as university_id,
         u.name, 
         u.city, 
         u.country, 
         u.program, 
         u.deadline,
         u.min_gpa,
         u.language
       FROM applications a
       JOIN universities u ON a.university_id = u.id
       WHERE a.user_id = $1
       ORDER BY u.deadline ASC`,
      [userId]
    );

    return {
      type: "tracker",
      data: result.rows,
      total: result.rows.length,
      message: result.rows.length > 0 
        ? `You're tracking ${result.rows.length} universities`
        : "Your tracker is empty. Would you like me to recommend some universities to add?"
    };
  } catch (err) {
    console.error("Get tracker error:", err);
    return { type: "error", message: `Database error: ${err.message}` };
  }
}

// ============================================
// RESPONSE GENERATION
// ============================================

async function generateResponse(actionResult, intent, profile, message, history, language) {
  const replyLanguage =
    language === "zh" || language === "chinese"
      ? "Chinese"
      : "English";

  const systemPrompt = `You are UniPath Assistant, a friendly and knowledgeable university application advisor.

CURRENT ACTION RESULT:
${JSON.stringify(actionResult, null, 2)}

USER PROFILE:
- GPA: ${profile.gpa ?? "Not set"}
- Preferred City: ${profile.preferred_city ?? "Not set"}
- Preferred Program: ${profile.preferred_program ?? "Not set"}
- Preferred Language: ${profile.preferred_language ?? "Not set"}

INTENT DETECTED:
${JSON.stringify(intent, null, 2)}

RESPONSE GUIDELINES:
1. Be conversational and helpful, not robotic
2. If showing universities, summarize the key findings first
3. Mention relevant deadlines if they're coming up soon
4. Give actionable advice when appropriate
5. Keep responses concise - 2-3 short paragraphs max
6. If no results found, suggest alternatives or ask for different criteria
7. Use the actual data from ACTION RESULT - don't make up universities
8. If the action type is "chat" or "advice" or "explain", respond naturally without data
9. Always reply in ${replyLanguage}

FORMAT:
- Don't use bullet points unless listing 4+ items
- Don't use headers
- Write in natural paragraphs
- End with a helpful follow-up question or suggestion when appropriate

Respond to the user's message naturally using the action result data.`;

  const response = await callAI([
    { role: "system", content: systemPrompt },
    ...history.slice(-4),
    { role: "user", content: message }
  ]);

  return response;
}

// ============================================
// MAIN CONTROLLER
// ============================================

const chatWithAdvisor = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { message, history = [], language } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    // Get user profile
    const profileRes = await pool.query(
      `SELECT gpa, preferred_city, preferred_program, preferred_language
       FROM users WHERE id = $1`,
      [userId]
    );
    const profile = profileRes.rows[0] || {};

    // Step 1: Detect intent
    console.log("=== Detecting Intent ===");
    const intent = await detectIntent(message, profile, history);
    console.log("Intent:", JSON.stringify(intent, null, 2));

    // Step 2: Handle clarification if needed
    if (intent.needs_clarification && intent.clarification_question) {
      return res.json({
        reply: intent.clarification_question,
        action: null,
        data: null
      });
    }

    // Step 3: Execute primary action
    console.log("=== Executing Action ===");
    const actionResult = await executeAction(
      intent.primary_action,
      intent.parameters,
      profile,
      userId
    );
    console.log("Action Result:", JSON.stringify(actionResult, null, 2));

    // Step 4: Generate natural language response
    console.log("=== Generating Response ===");
    const reply = await generateResponse(actionResult, intent, profile, message, history, language);

    // Step 5: Return response with optional data for UI rendering
    const response = {
      reply,
      action: intent.primary_action,
      data: actionResult.data || null,
      meta: {
        filters_used: actionResult.filters_used,
        total: actionResult.total,
        type: actionResult.type
      }
    };

    // Include recommendations array for UI cards if applicable
    if (actionResult.type === "universities" || actionResult.type === "recommendations") {
      response.recommendations = actionResult.data;
    }

    return res.json(response);

  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { chatWithAdvisor };