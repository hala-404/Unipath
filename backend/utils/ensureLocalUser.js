async function ensureLocalUser(pool, clerkUserId, email) {
  if (!clerkUserId) {
    const err = new Error("Missing Clerk user ID");
    err.status = 401;
    throw err;
  }

  let userRes = await pool.query(
    `SELECT id, email, clerk_user_id
     FROM users
     WHERE clerk_user_id = $1
     LIMIT 1`,
    [clerkUserId]
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
      [clerkUserId, email]
    );

    if (userRes.rows.length > 0) {
      return userRes.rows[0];
    }

    userRes = await pool.query(
      `INSERT INTO users (email, clerk_user_id)
       VALUES ($1, $2)
       RETURNING id, email, clerk_user_id`,
      [email, clerkUserId]
    );

    return userRes.rows[0];
  }

  const err = new Error("No local user found and Clerk email is unavailable");
  err.status = 400;
  throw err;
}

module.exports = { ensureLocalUser };
