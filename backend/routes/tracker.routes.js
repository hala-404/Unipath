const express = require("express");
const authRequired = require("../middleware/auth.middleware");
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/tracker.controller");

const router = express.Router();

router.post("/", authRequired, createApplication);
router.get("/", authRequired, listApplications);
router.put("/:id", authRequired, updateApplicationStatus);
router.delete("/:id", authRequired, deleteApplication);

module.exports = router;