const cron = require("node-cron");
const axios = require("axios");

/**
 * Cron job to generate a new blog - only used in development
 * In production, this is handled by GitHub Actions
 */
module.exports = function setupCronJobs() {
  // Only run cron in development
  if (process.env.NODE_ENV === "production") {
    console.log(
      "Skipping cron job setup in production (handled by GitHub Actions)"
    );
    return;
  }

  // Schedule: "0 */3 * * *" = every 3 hours
  cron.schedule("0 */3 * * *", async () => {
    console.log(
      "Running scheduled blog generation (development):",
      new Date().toISOString()
    );

    try {
      // Call our own API to generate a new blog
      await axios.post(
        `${process.env.API_BASE_URL}/api/blogs/generate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }
      );

      console.log("Successfully generated new blog via cron job");
    } catch (error) {
      console.error("Cron job failed to generate blog:", error);
    }
  });

  console.log("Development blog generator cron job scheduled");
};
