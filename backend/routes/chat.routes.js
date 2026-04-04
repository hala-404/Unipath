const express = require("express");
const authRequired = require("../middleware/auth.middleware");
const { chatWithAdvisor } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", authRequired, chatWithAdvisor);

module.exports = router;