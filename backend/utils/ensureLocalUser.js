const { getAuth } = require("@clerk/express");

async function ensureLocalUser(pool, req) {
  const { userId, sessionClaims } = getAuth(req);

  if (!userId) {
    const err = new Error("User not authenticated");
    err.status = 401;
    throw err;
  }

  const email =
    sessionClaims?.email ||
    sessionClaims?.email_address ||
    sessionClaims?.primary_email_address ||
    sessionClaims?.primaryEmailAddress ||
    sessionClaims?.emailAddresses?.[0]?.emailAddress ||
    sessionClaims?.email_addresses?.[0]?.email_address ||
    null;

  let userRes = await pool.query(
    `SELECT id, email, clerk_user_id
     FROM users
     WHERE clerk_user_id = $1
     LIMIT 1`,
    [userId]
  );

  if (userRes.rows.length > 0) {
    return userRes.rows[0];
  }

  if (email) {
    userRes = await pool.query(
      `UPDATE users
       SET clerk_user_id = $1
       WHERE email = $2
       RETURNING id, email, clerk_user_id`,
      [userId, email]
    );

    if (userRes.rows.length > 0) {
      return userRes.rows[0];
    }

    userRes = await pool.query(
      `INSERT INTO users (email, clerk_user_id)
       VALUES ($1, $2)
       RETURNING id, email, clerk_user_id`,
      [email, userId]
    );

    return userRes.rows[0];
  }

  const err = new Error("No local user found and Clerk email is unavailable");
  err.status = 400;
  throw err;
}

module.exports = { ensureLocalUser };
