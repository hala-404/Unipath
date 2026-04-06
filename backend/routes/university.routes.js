const express = require("express");
const { requireAuth } = require("@clerk/express");
const { listUniversities } = require("../controllers/university.controller");
const { getRecommendations } = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/", listUniversities);
router.get("/recommendations", requireAuth(), getRecommendations);

module.exports = router;