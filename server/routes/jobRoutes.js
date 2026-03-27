const express = require("express");
const router = express.Router();
const multer = require("multer");
const jobController = require("../controllers/jobController");
const rateLimit = require("express-rate-limit");
const { protect, admin } = require("../middleware/authMiddleware");

// Setup multer for memory storage (we don't want to save PDFs to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Rate limiting for the extraction endpoint to prevent abuse
const extractionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 resume parses per 15 minutes
  message: {
    error:
      "Too many resume parsing requests from this IP, please try again later.",
  },
});

// Extract skills from resume (requires a multipart form data with file field "resume")
router.post(
  "/extract-skills",
  protect,
  admin,
  extractionLimiter,
  upload.single("resume"),
  jobController.extractSkills,
);

// Search for jobs via JSearch API
router.get("/search", protect, admin, jobController.searchJobs);

module.exports = router;
