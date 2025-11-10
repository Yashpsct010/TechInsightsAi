const mongoose = require("mongoose");

/**
 * A cached connection promise.
 * This prevents multiple connections from being initiated during concurrent serverless invocations.
 */
let cachedPromise = null;

/**
 * Connects to the MongoDB database, reusing existing connections or cached promises.
 * This function is idempotent and optimized for serverless environments.
 */
const connectToDB = async () => {
  // If we have a cached promise, we are already connecting or are connected.
  if (cachedPromise) {
    return cachedPromise;
  }

  // Check if we have a live connection. `readyState === 1` means connected.
  if (mongoose.connection.readyState === 1) {
    console.log("Using existing database connection.");
    return Promise.resolve(); // Return a resolved promise.
  }

  console.log("Creating new database connection.");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // Set up a new connection promise.
  // All subsequent calls to connectToDB will wait for this promise to resolve.
  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 5, // Maintain up to 5 socket connections
    retryWrites: true,
    w: "majority",
  });

  try {
    await cachedPromise;
    console.log("MongoDB successfully connected.");

    // Clear the promise cache on disconnect to allow for reconnection.
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected.");
      cachedPromise = null;
    });
  } catch (error) {
    // If the connection fails, nullify the promise so that a future request can retry.
    cachedPromise = null;
    console.error("MongoDB connection error:", error.message);
    throw error;
  }

  return cachedPromise;
};

module.exports = connectToDB;
