const express = require("express");
const router = express.Router();
const intelController = require("../controllers/intelController");
const rateLimit = require("express-rate-limit");
const { protect, admin } = require("../middleware/authMiddleware");

// Shared limiter for API abuse prevention
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  skip: (req) => {
    // Bypass rate limit for authorized cron jobs
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ") && process.env.CRON_SECRET) {
      return authHeader.split(" ")[1] === process.env.CRON_SECRET;
    }
    return false;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many intel generation requests. Please try again later." },
});

// GET /api/intel/today -> Fetches the intel
router.get("/today", intelController.getTodayIntel);

// POST /api/intel/generate -> Triggers daily generation (hit by cron job)
router.post("/generate", generateLimiter, (req, res, next) => {
  // We manually verify the CRON_SECRET here to allow automated triggers without user auth
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (token && process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
    return next(); // Let cron bypass normal admin checks
  }

  // If not cron, fall back to requiring actual logged-in admin
  protect(req, res, () => admin(req, res, next));
}, intelController.generateIntel);

module.exports = router;
