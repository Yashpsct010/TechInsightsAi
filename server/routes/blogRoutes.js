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

// Diagnostic endpoint for GitHub Actions to check database connection
router.get("/diagnose", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStateText = [
      "disconnected",
      "connected",
      "connecting",
      "disconnecting",
    ][dbState];

    // Count blogs by genre
    const countsByGenre = await Blog.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Get most recent blog
    const latestBlog = await Blog.findOne({})
      .sort({ createdAt: -1 })
      .select("title genre createdAt");

    // Try a simple write operation
    const testId = new mongoose.Types.ObjectId();
    let writeTest = "not attempted";

    try {
      await mongoose.connection.db.collection("diagnostics").insertOne({
        _id: testId,
        test: "connection",
        timestamp: new Date(),
      });
      writeTest = "success";
    } catch (writeError) {
      writeTest = `failed: ${writeError.message}`;
    }

    res.json({
      timestamp: new Date(),
      database: {
        state: dbStateText,
        readyState: dbState,
      },
      blogCounts: countsByGenre,
      latestBlog: latestBlog,
      writeTest: writeTest,
    });
  } catch (error) {
    res.status(500).json({
      error: "Diagnostic failed",
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
});

module.exports = router;
