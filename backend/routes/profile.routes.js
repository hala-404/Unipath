const express = require("express");
const authRequired = require("../middleware/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/profile.controller");

const router = express.Router();

router.get("/", authRequired, getProfile);
router.put("/", authRequired, updateProfile);

module.exports = router;