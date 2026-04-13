function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateEnv() {
  requireEnv("PORT");
  requireEnv("DATABASE_URL");
  requireEnv("CLERK_SECRET_KEY");
  requireEnv("CLERK_PUBLISHABLE_KEY");

  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY is not set; chat endpoint will fail until configured.");
  }
}

module.exports = { validateEnv };