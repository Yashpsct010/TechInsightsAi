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

  // Create a new connection promise
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 0,
  });

  try {
    await connectionPromise;
    isConnected = true;
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  } finally {
    connectionPromise = null;
  }
};

module.exports = { connectToDatabase };
