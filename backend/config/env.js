function requireEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateEnv() {
  requireEnv("PORT");
  requireEnv("DB_HOST");
  requireEnv("DB_PORT");
  requireEnv("DB_NAME");
  requireEnv("DB_USER");
  requireEnv("JWT_SECRET");

  if (!process.env.JWT_EXPIRES_IN) process.env.JWT_EXPIRES_IN = "7d";
  if (!process.env.BCRYPT_SALT_ROUNDS) process.env.BCRYPT_SALT_ROUNDS = "10";
}

module.exports = { validateEnv };