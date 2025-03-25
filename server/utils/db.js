const mongoose = require("mongoose");

let isConnected = false;
let connectionPromise = null;

// Optimized connection function for serverless environments
const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  // Reuse connection promise if connection is in progress
  if (connectionPromise) {
    console.log("Waiting for in-progress connection...");
    await connectionPromise;
    return;
  }

  console.log("Attempting MongoDB connection...");

  // Create a new connection promise with retry logic
  const connectWithRetry = async (retryCount = 0, maxRetries = 3) => {
    try {
      const uri = process.env.MONGODB_URI;
      console.log(`MongoDB URI format check: ${uri.substring(0, 20)}...`);

      // Set mongoose options to reduce serverless issues
      mongoose.set("strictQuery", false);

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 0,
        retryWrites: true,
        w: "majority",
        keepAlive: true,
        keepAliveInitialDelay: 300000,
      });

      isConnected = true;
      console.log("MongoDB successfully connected");

      // Set up disconnection handler
      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        isConnected = false;
      });

      return true;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${retryCount + 1} failed:`,
        error.message
      );

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
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

// Ensure a connection is active or reconnect
const ensureConnection = async () => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    console.log("Reconnecting to MongoDB...");
    isConnected = false;
    await connectToDatabase();
  }
  return isConnected;
};

module.exports = { connectToDatabase, ensureConnection };
