const express = require("express");
const { listUniversities, getUniversityById } = require("../controllers/university.controller");
const { getRecommendations } = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/", listUniversities);
router.get("/recommendations", getRecommendations);
router.get("/:id", getUniversityById);

module.exports = router;