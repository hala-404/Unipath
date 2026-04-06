const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
  updateApplicationChecklist,
  deleteApplication,
} = require("../controllers/tracker.controller");

const router = express.Router();

router.post("/", requireAuth(), createApplication);
router.get("/", requireAuth(), listApplications);
router.put("/:id", requireAuth(), updateApplicationStatus);
router.put("/:id/checklist", requireAuth(), updateApplicationChecklist);
router.delete("/:id", requireAuth(), deleteApplication);

module.exports = router;