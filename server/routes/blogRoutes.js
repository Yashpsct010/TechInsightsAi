const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

// Get latest blog (or generate new one if cache expired)
router.get("/latest", blogController.getLatestBlog);

// Get all blogs with pagination
router.get("/all", blogController.getAllBlogs);

// Generate a new blog (protected, for admin or cron job)
router.post("/generate", blogController.generateBlog);

// Get a single blog by ID - new endpoint
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error(`Error fetching blog with ID ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
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

module.exports = router;
