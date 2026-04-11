const express = require("express");
const router = express.Router();

const { requireAuth } = require("@clerk/express");
const { chatWithAdvisor, getChatSuggestions } = require("../controllers/chat.controller");

router.get("/suggestions", requireAuth(), getChatSuggestions);
router.post("/", requireAuth(), chatWithAdvisor);

module.exports = router;