const mongoose = require("mongoose");

let isConnected = false;
let connectionPromise = null;

// Optimized connection function for serverless environments
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  // Reuse connection promise if connection is in progress
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  console.log("Attempting MongoDB connection...");

  // Create a new connection promise with retry logic
  const connectWithRetry = async (retryCount = 0, maxRetries = 3) => {
    try {
      const uri = process.env.MONGODB_URI;
      console.log(`MongoDB URI format check: ${uri.substring(0, 20)}...`);

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000, // Increased from 5000
        socketTimeoutMS: 45000, // Increased from 30000
        connectTimeoutMS: 10000, // Increased from 5000
        maxPoolSize: 5, // Reduced from 10 for serverless
        minPoolSize: 0,
        retryWrites: true,
        w: "majority", // Added for more reliable writes
      });

      isConnected = true;
      console.log("MongoDB successfully connected");
      return true;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${retryCount + 1} failed:`,
        error.message
      );

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return connectWithRetry(retryCount + 1, maxRetries);
      } else {
        throw error;
      }
    }
  };

  try {
    connectionPromise = connectWithRetry();
    await connectionPromise;
  } catch (error) {
    console.error("Final MongoDB connection error:", error.message);
    throw error;
  } finally {
    connectionPromise = null;
  }
};

module.exports = { connectToDatabase };
