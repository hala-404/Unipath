const express = require("express");
const router = express.Router();

const { requireAuth } = require("@clerk/express");
const { chatWithAdvisor } = require("../controllers/chat.controller");

router.post("/", requireAuth(), chatWithAdvisor);

module.exports = router;