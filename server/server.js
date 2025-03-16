require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Limit payload size

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

// Function to connect to MongoDB - with more error handling
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
      console.log("MongoDB connected");
    } else {
      console.log("MongoDB already connected");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err; // Re-throw for serverless handler
  }
};

// Define routes - ensure the path prefix matches frontend requests
app.use("/api/blogs", blogRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root route
app.get("/", (req, res) => res.send("Backend is running!"));

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
  // Export the app for serverless use
  module.exports = app;
} else {
  // Traditional server startup for local development
  const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Only run cron jobs in traditional environment
      if (!process.env.VERCEL) {
        const setupCronJobs = require("./cron/blogGenerator");
        setupCronJobs();
      }
    });
  };
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

// Always ensure DB connection for serverless
connectDB().catch((err) => {
  console.error("Failed to connect to database in serverless mode:", err);
  // Don't exit process in serverless environment
});
