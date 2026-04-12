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

function normalizeForMatching(text = "") {
  return normalizeText(text)
    .replace(/[^a-z0-9\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWholePhrase(text, phrase) {
  const normalizedText = normalizeForMatching(text);
  const normalizedPhrase = normalizeForMatching(phrase);

  if (!normalizedText || !normalizedPhrase) {
    return false;
  }

  const pattern = new RegExp(`\\b${escapeRegExp(normalizedPhrase)}\\b`);
  return pattern.test(normalizedText);
}

function messageHasAny(message, keywords) {
  return keywords.some((word) => containsWholePhrase(message, word));
}

function wantsAlternatives(message) {
  const lower = normalizeForMatching(message);
  const alternativeKeywords = [
    "another",
    "other",
    "different",
    "else",
    "alternative",
    "more options",
    "what else",
    "something else",
    "besides",
    "instead",
    "not that",
    "give me more",
    "any other",
  ];
  const negationPattern = /\b(?:do not|don't|dont|no|not)\b.*\b(?:another|other|different|else|alternative|more options|what else|something else|besides|instead|give me more|any other)\b/;

  if (negationPattern.test(lower)) {
    return false;
  }

  return alternativeKeywords.some((kw) => containsWholePhrase(lower, kw));
}

function extractMentionedMajors(history, availableMajors = []) {
  if (typeof history === "string") {
    const text = normalizeForMatching(history);
    const fallbackMajors = [
      "computer science",
      "data science",
      "business analytics",
      "mathematics",
      "statistics",
      "engineering",
      "finance",
      "medicine",
      "psychology",
      "design",
      "biology",
      "artificial intelligence",
      "ai",
    ];

    return fallbackMajors.filter((major) => containsWholePhrase(text, major));
  }

  const mentioned = new Set();
  const allText = history
    .map((msg) => msg.content || "")
    .join(" ");

  availableMajors.forEach((major) => {
    if (containsWholePhrase(allText, major)) {
      mentioned.add(major);
    }
  });

  return Array.from(mentioned);
}

function extractInterestsFromHistory(history) {
  const allText = history
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content || "")
    .join(" ");

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
  const majorScores = {};
  availableMajors.forEach((major) => {
    if (excludeMajors.some((ex) => normalizeForMatching(ex) === normalizeForMatching(major))) {
      majorScores[major] = -100;
    } else {
      majorScores[major] = 0;
    }
  });

  const boostIfExists = (majorName, points) => {
    const found = availableMajors.find(
      (m) => normalizeForMatching(m) === normalizeForMatching(majorName)
    );
    if (found && majorScores[found] >= 0) {
      majorScores[found] += points;
    }
  };

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

  return Object.entries(majorScores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
}

function formatResponse(text) {
  if (!text) return "";

  let formatted = text;
  formatted = formatted.replace(/(\d)\.\s+(\d)/g, "$1.$2");
  formatted = formatted.replace(/(\d)\.(\d)/g, "$1<<<DOT>>>$2");

  const sentences = formatted
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }

  formatted = paragraphs.join("\n\n");
  formatted = formatted.replace(/<<<DOT>>>/g, ".");
  formatted = formatted.replace(/\n{3,}/g, "\n\n").trim();

  return formatted;
}

module.exports = {
  safeJsonParse,
  normalizeText,
  normalizeForMatching,
  messageHasAny,
  wantsAlternatives,
  extractMentionedMajors,
  extractInterestsFromHistory,
  scoreMajorsFromMessage,
  formatResponse,
};
