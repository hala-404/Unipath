const express = require("express");
const { getDashboardData } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/", getDashboardData);

module.exports = router;
