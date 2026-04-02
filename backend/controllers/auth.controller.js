const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.status = 400;
    throw error;
  }

  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existingUser.rows.length > 0) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email`,
    [email, hashedPassword]
  );

  return res.status(201).json({
    message: "User registered successfully",
    user: result.rows[0],
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const user = result.rows[0];

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.json({
    message: "Login successful",
    token,
    user: { id: user.id, email: user.email },
  });
}

module.exports = { register, login };