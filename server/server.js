require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Updated CORS configuration for the new domain
app.use(
  cors({
    origin: [
      "https://techinsightsai.vercel.app",
      // "http://localhost:5173", // Uncomment for local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);



app.use(express.json({ limit: "1mb" })); // Reduced payload limit for faster processing

// Simple error handler middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Server error occurred",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const connectToDB = require("./utils/db");

// Define routes with fast timeouts
app.use("/api/blogs", blogRoutes);

// Health check route - simplified
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Root route - simplified
app.get("/", (req, res) => res.send("Backend running"));

// Handle 404 errors for any other routes
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} does not exist`,
  });
});

// For serverless environments like Vercel
if (process.env.VERCEL) {
  // Connect to DB when module loads for faster cold starts
  connectToDB().catch(console.error);

  // Export the app for serverless use
  module.exports = app;
} else {
  // Traditional server startup for local development
  const startServer = async () => {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Only run cron jobs in traditional environment
      if (!process.env.VERCEL) {
        const setupCronJobs = require("./cron/blogGenerator");
        setupCronJobs();
      }
    });
  };

  startServer().catch(console.error);
}

// Always ensure DB connection for serverless
connectToDB().catch((err) => {
  console.error("Failed to connect to database in serverless mode:", err);
  // Don't exit process in serverless environment
});
