const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/tracker.controller");

const router = express.Router();

router.post("/", requireAuth(), createApplication);
router.get("/", requireAuth(), listApplications);
router.put("/:id", requireAuth(), updateApplicationStatus);
router.delete("/:id", requireAuth(), deleteApplication);

module.exports = router;