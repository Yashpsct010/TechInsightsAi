require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const blogRoutes = require("./routes/blogRoutes");
const setupCronJobs = require("./cron/blogGenerator");

const app = express();
const PORT = process.env.PORT || 5000;

// More permissive CORS setup
app.use(cors());

// Optional: For specific CORS needs, you can set up a custom middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }
  next();
});

app.use(express.json());

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if DB connection fails
  }
};

// Define an async function to start the server
const startServer = async () => {
  await connectDB();

  // Routes
  app.use("/api/blogs", blogRoutes);

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Root route
  app.get("/", (req, res) => res.send("Backend is running!"));

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Setup cron jobs after server starts
    setupCronJobs();
  });
};

// Start the application
startServer();
