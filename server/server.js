require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const blogRoutes = require("./routes/blogRoutes");
const setupCronJobs = require("./cron/blogGenerator");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://techinsightsai.vercel.app",
      process.env.BASE_URL,
      "http://localhost:5173",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
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
