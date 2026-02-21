const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const rateLimit = require("express-rate-limit");

// Strict rate limiter for the generate endpoint
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many generation requests from this IP. Please try again after an hour",
  },
});

// Lightweight diagnostic endpoint for GitHub Actions
router.get("/diagnose", async (req, res) => {
  try {
    // Return basic information immediately without database operations
    const basicInfo = {
      timestamp: new Date(),
      serverStatus: "running",
      database: {
        state: mongoose.connection.readyState,
        stateText: ["disconnected", "connected", "connecting", "disconnecting"][
          mongoose.connection.readyState
        ],
      },
      environment: {
        vercel: process.env.VERCEL ? "true" : "false",
        nodeEnv: process.env.NODE_ENV || "not set",
      },
    };

    // Send the basic response immediately
    res.json(basicInfo);
  } catch (error) {
    res.status(500).json({
      error: "Diagnostic check failed",
      message: error.message,
    });
  }
});

// Simple CORS test endpoint
router.get("/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is properly configured!",
    origin: req.headers.origin || "No origin header",
    timestamp: new Date().toISOString(),
  });
});

// Get latest blog (or generate new one if cache expired)
router.get("/latest", blogController.getLatestBlog);

// Get all blogs with pagination
router.get("/all", blogController.getAllBlogs);

// Generate a new blog (protected, for admin or cron job, with strict rate limiting)
router.post("/generate", generateLimiter, blogController.generateBlog);

// Get a single blog by ID - new endpoint
router.get("/:id", blogController.getBlogById);

module.exports = router;
