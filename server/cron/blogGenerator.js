const cron = require("node-cron");
const axios = require("axios");

/**
 * Cron job to generate a new blog every 3 hours
 * Runs at minutes 0 of every 3rd hour
 */
module.exports = function setupCronJobs() {
  // Schedule: "0 */3 * * *" = At minute 0 of every 3rd hour
  cron.schedule("0 */3 * * *", async () => {
    console.log("Running scheduled blog generation:", new Date().toISOString());

    try {
      // Call our own API to generate a new blog
      await axios.post(
        `${process.env.API_BASE_URL}/api/blogs/generate`,
        {},
        {
          headers: {
            // Include any auth headers needed
            Authorization: `Bearer ${process.env.CRON_API_KEY}`,
          },
        }
      );

      console.log("Successfully generated new blog via cron job");
    } catch (error) {
      console.error("Cron job failed to generate blog:", error);
    }
  });

  console.log("Blog generator cron job scheduled");
};
