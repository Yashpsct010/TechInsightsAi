const express = require('express');
const router = express.Router();
const { dispatchNewsletter } = require('../cron/newsletterGenerator');
const rateLimit = require("express-rate-limit");

// Prevent abuse of the dispatch endpoint
const dispatchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Allow up to 3 dispatches per hour just in case of retries
  skip: (req) => {
    // Bypass rate limit if it's the authorized CRON agent
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ") && process.env.CRON_SECRET) {
      return authHeader.split(" ")[1] === process.env.CRON_SECRET;
    }
    return false;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many newsletter dispatch requests." },
});

router.post('/dispatch', dispatchLimiter, async (req, res) => {
    // Basic protection using CRON_SECRET
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists and matches our server's internal CRON_SECRET
    if (!authHeader || !authHeader.startsWith("Bearer ") || !process.env.CRON_SECRET || authHeader.split(" ")[1] !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: "Unauthorized cron request: Invalid or missing token" });
    }
    
    try {
        // Trigger the logic extracted from the node-cron scheduler
        await dispatchNewsletter();
        res.status(200).json({ success: true, message: "Newsletter dispatched successfully" });
    } catch (error) {
        console.error("Newsletter dispatch failed:", error);
        res.status(500).json({ error: "Failed to dispatch newsletter" });
    }
});

module.exports = router;
