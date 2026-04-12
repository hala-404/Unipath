const express = require("express");
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
  updateApplicationChecklist,
  deleteApplication,
} = require("../controllers/tracker.controller");

const router = express.Router();

router.post("/", createApplication);
router.get("/", listApplications);
router.put("/:id", updateApplicationStatus);
router.put("/:id/checklist", updateApplicationChecklist);
router.delete("/:id", deleteApplication);

module.exports = router;