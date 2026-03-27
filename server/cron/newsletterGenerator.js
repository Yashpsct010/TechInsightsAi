const cron = require('node-cron');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { sendNewsletter } = require('../services/newsletterService');

const dispatchNewsletter = async () => {
    console.log('Initiating Neural_Feed_Newsletter transmission sequence...', new Date().toISOString());
    try {
            // Find users subscribed to the newsletter
            const subscribers = await User.find({ newsletterSubscribed: true });
            
            if (subscribers.length === 0) {
                console.log('No active nodes subscribed to Neural_Feed. Aborting transmission.');
                return;
            }

            // Find top blogs (latest 5 blogs)
            const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);

            if (recentBlogs.length === 0) {
                console.log('No new data packets to transmit.');
                return;
            }

            let successCount = 0;
            let failCount = 0;

            // Transmit to each subscriber
            for (const user of subscribers) {
                const sent = await sendNewsletter(user, recentBlogs);
                if (sent) successCount++;
                else failCount++;
            }

            console.log(`Transmission sequence complete. Success: ${successCount}. Failures: ${failCount}.`);
    } catch (error) {
        console.error('Critical failure in Newsletter Generator:', error);
    }
};

const setupNewsletterCron = () => {
    // "0 17 * * 5" = Every Friday at 17:00
    cron.schedule('0 17 * * 5', dispatchNewsletter);
    console.log("Weekly Newsletter Generator Cron Scheduled: Every Friday at 17:00");
};

module.exports = {
    setupNewsletterCron,
    dispatchNewsletter
};
