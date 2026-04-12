const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { chatWithAdvisor, getChatSuggestions } = require("../controllers/chat.controller");

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many chat requests, please try again later." },
});

router.get("/suggestions", getChatSuggestions);
router.post("/", chatLimiter, chatWithAdvisor);

module.exports = router;