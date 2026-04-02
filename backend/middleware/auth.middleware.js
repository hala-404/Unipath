const jwt = require("jsonwebtoken");
function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization; // "Bearer <token>"
    if (!header) return res.status(401).json({ error: "Missing Authorization header" });

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid Authorization format. Use: Bearer <token>" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request (so routes can use it)
    req.user = payload; // { user_id, email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
module.exports = authRequired;