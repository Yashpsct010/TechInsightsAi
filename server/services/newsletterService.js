const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // e.g., your generic sender email
        pass: process.env.EMAIL_APP_PASSWORD, // your app password
    },
});

// Verify connection configuration
transporter.verify(function(error) {
    if (error) {
        console.error('NodeMailer configuration error:', error);
        console.warn('-> Ensure EMAIL_USER and EMAIL_APP_PASSWORD are set in the server .env file.');
    } else {
        console.log('NodeMailer is authenticated and ready to dispatch Neural Feed emails.');
    }
});

/**
 * Generates the HTML template for the newsletter
 * @param {Array} blogs - Array of blog objects
 * @returns {String} HTML string
 */
const generateNewsletterHTML = (blogs) => {
    let html = `
    <div style="font-family: 'Courier New', Courier, monospace; background-color: #0a0a0c; color: #f1f5f9; padding: 30px; border: 1px solid #333; border-radius: 8px;">
        <h1 style="color: #ec5b13; text-transform: uppercase;">TechInsights.AI <span style="font-size: 14px; color: #8b5cf6;">// Neural_Feed_Weekly</span></h1>
        <p style="color: #94a3b8; font-size: 14px;">Incoming data packet: Top synthetic intel for the week.</p>
        <hr style="border-color: #333; margin-bottom: 30px;" />
    `;

    blogs.forEach(blog => {
        html += `
        <div style="margin-bottom: 25px; padding: 15px; background-color: #121212; border-left: 3px solid #ec5b13;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #e2e8f0;">${blog.title}</h2>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">${(blog.body || '').substring(0, 150) + '...'}</p>
            <a href="${process.env.CLIENT_URL || 'https://techinsightsai.vercel.app'}/blog/${blog._id}" style="display: inline-block; background-color: #ec5b13; color: white; padding: 6px 12px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px;">Initialize_Read</a>
        </div>
        `;
    });

    html += `
        <hr style="border-color: #333; margin-top: 30px; margin-bottom: 20px;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">
            You are receiving this encrypted transmission because your Auth_Level permits Neural_Feed_Newsletter access.<br/>
            You can modify your sync protocols in your <a href="${process.env.CLIENT_URL || 'https://techinsightsai.vercel.app'}/profile" style="color: #ec5b13;">Config_Prefs</a>.
        </p>
    </div>
    `;

    return html;
};

/**
 * Sends the newsletter to a specific user
 * @param {Object} user - User object containing email
 * @param {Array} blogs - Array of blogs to include in the email
 */
const sendNewsletter = async (user, blogs) => {
    try {
        const mailOptions = {
            from: `"TechInsights.AI System" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'System Alert: Weekly Tech Intel Dispatched // TechInsights.AI',
            html: generateNewsletterHTML(blogs),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Newsletter dispatched to ${user.email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Transmission failure for ${user.email}:`, error.message);
        return false;
    }
};

module.exports = {
    sendNewsletter,
    generateNewsletterHTML
};
