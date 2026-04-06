const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { chatWithAdvisor } = require("../controllers/chat.controller");

router.post("/", authMiddleware, chatWithAdvisor);

module.exports = router;