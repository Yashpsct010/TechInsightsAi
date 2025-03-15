const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

// Get latest blog (or generate new one if cache expired)
router.get("/latest", blogController.getLatestBlog);

// Get all blogs with pagination
router.get("/all", blogController.getAllBlogs);

// Generate a new blog (protected, for admin or cron job)
router.post("/generate", blogController.generateBlog);

module.exports = router;
