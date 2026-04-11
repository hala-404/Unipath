const express = require("express");
const { requireAuth } = require("@clerk/express");
const { getDashboardData } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/", requireAuth(), getDashboardData);

module.exports = router;
