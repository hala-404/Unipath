const express = require("express");
const authRequired = require("../middleware/auth.middleware");
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
  updateApplicationChecklist,
  deleteApplication,
} = require("../controllers/tracker.controller");

const router = express.Router();

router.post("/", authRequired, createApplication);
router.get("/", authRequired, listApplications);
router.put("/:id", authRequired, updateApplicationStatus);
router.put("/:id/checklist", authRequired, updateApplicationChecklist);
router.delete("/:id", authRequired, deleteApplication);

module.exports = router;