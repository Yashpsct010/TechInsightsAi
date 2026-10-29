import nodemailer from 'nodemailer';
import { connectToDatabase, User, Blog, Intel } from '@techinsights/database';
import { config } from '../config/env';

export function createTransporter() {
  if (!config.emailUser || !config.emailPassword) {
    console.warn('[Newsletter] EMAIL_USER or EMAIL_APP_PASSWORD not configured. Emails will not send.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
}

export function generateNewsletterHTML(blogs: any[], latestIntel: any = null): string {
  let html = `
  <div style="font-family: 'Courier New', Courier, monospace; background-color: #0a0a0c; color: #f1f5f9; padding: 30px; border: 1px solid #222; border-radius: 8px; max-width: 650px; margin: 0 auto;">
    <h1 style="color: #ec5b13; text-transform: uppercase; margin-bottom: 5px;">TechInsights.AI <span style="font-size: 14px; color: #8b5cf6;">// Neural_Feed_Weekly</span></h1>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">Incoming data packet: Top synthetic intelligence for the cycle.</p>
    <hr style="border-color: #262626; margin: 20px 0;" />
  `;

  if (latestIntel && latestIntel.intelHook) {
    html += `
    <div style="margin-bottom: 25px; padding: 18px; background-color: #141419; border: 1px solid #8b5cf6; border-radius: 6px;">
      <h2 style="margin: 0 0 10px 0; font-size: 13px; color: #8b5cf6; text-transform: uppercase; letter-spacing: 1.5px;">⚡ Priority Intel // ${latestIntel.topic || 'Direct_Bypass'}</h2>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #e2e8f0; font-weight: bold; line-height: 1.5;">${latestIntel.intelHook}</p>
      ${latestIntel.referenceUrl ? `<a href="${latestIntel.referenceUrl}" style="color: #8b5cf6; font-size: 12px; text-decoration: underline;">[ACCESS_SOURCE_MATERIAL]</a>` : ''}
    </div>
    `;
  }

  blogs.forEach((blog) => {
    html += `
    <div style="margin-bottom: 20px; padding: 15px; background-color: #121212; border-left: 3px solid #ec5b13; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #ffffff;">${blog.title}</h3>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">${(blog.body || '').replace(/<[^>]*>/g, '').substring(0, 160)}...</p>
      <a href="${config.clientUrl}/blog/${blog._id}" style="display: inline-block; background-color: #ec5b13; color: white; padding: 6px 14px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px;">Initialize_Read &rarr;</a>
    </div>
    `;
  });

  html += `
    <hr style="border-color: #262626; margin: 25px 0 15px 0;" />
    <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
      You are receiving this encrypted transmission because your Auth_Level permits Neural_Feed_Newsletter access.<br/>
      Adjust your synchronization protocol inside your <a href="${config.clientUrl}/profile" style="color: #ec5b13;">Config_Prefs</a>.
    </p>
  </div>
  `;

  return html;
}

export async function dispatchNewsletter(): Promise<{ success: number; failed: number }> {
  await connectToDatabase();
  console.log('[Newsletter] Initiating Neural Feed transmission sequence...');

  const subscribers = await User.find({ newsletterSubscribed: true });
  if (subscribers.length === 0) {
    console.log('[Newsletter] No active nodes subscribed to Neural_Feed. Sequence aborted.');
    return { success: 0, failed: 0 };
  }

  const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
  if (recentBlogs.length === 0) {
    console.log('[Newsletter] No blog packets found to transmit.');
    return { success: 0, failed: 0 };
  }

  const latestIntel = await Intel.findOne().sort({ createdAt: -1 });
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Newsletter] No transporter available. Skipping dispatch.');
    return { success: 0, failed: subscribers.length };
  }

  const emailHtml = generateNewsletterHTML(recentBlogs, latestIntel);

  let successCount = 0;
  let failedCount = 0;

  for (const subscriber of subscribers) {
    try {
      await transporter.sendMail({
        from: `"TechInsights.AI System" <${config.emailUser}>`,
        to: subscriber.email,
        subject: '⚡ System Alert: Weekly Neural Intel Transmission // TechInsights.AI',
        html: emailHtml,
      });
      successCount++;
      console.log(`[Newsletter] Dispatched to ${subscriber.email}`);
    } catch (err: any) {
      failedCount++;
      console.error(`[Newsletter] Transmission failure for ${subscriber.email}:`, err.message);
    }
  }

  console.log(`[Newsletter] Sequence complete. Delivered: ${successCount}, Failures: ${failedCount}.`);
  return { success: successCount, failed: failedCount };
}
