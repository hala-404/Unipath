const express = require("express");
const authRequired = require("../middleware/auth.middleware");
const { listUniversities } = require("../controllers/university.controller");
const { getRecommendations } = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/", listUniversities);
router.get("/recommendations", authRequired, getRecommendations);

module.exports = router;