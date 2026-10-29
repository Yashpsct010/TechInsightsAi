import cron from 'node-cron';
import { generateBlog } from '../services/blogGenerator';
import { generateDailyIntel } from '../services/intelGenerator';
import { dispatchNewsletter } from '../services/newsletterService';

export function setupCronJobs() {
  console.log('[Scheduler] Initializing autonomous background schedules...');

  // 1. Daily Blog Generation - Every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] ⏰ Triggered: Daily Blog Generation @', new Date().toISOString());
    try {
      await generateBlog();
      console.log('[Scheduler] ✅ Daily Blog successfully published.');
    } catch (err: any) {
      console.error('[Scheduler] ❌ Daily Blog Generation failed:', err.message);
    }
  });
  console.log('[Scheduler] Registered: Blog Generator (Daily at 00:00)');

  // 2. Daily Intel Generation - Every day at 06:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] ⏰ Triggered: Daily Intel Generation @', new Date().toISOString());
    try {
      await generateDailyIntel(true);
      console.log('[Scheduler] ✅ Daily Intel packet generated.');
    } catch (err: any) {
      console.error('[Scheduler] ❌ Daily Intel Generation failed:', err.message);
    }
  });
  console.log('[Scheduler] Registered: Daily Intel Generator (Daily at 06:00)');

  // 3. Weekly Newsletter Transmission - Every Friday at 17:00
  cron.schedule('0 17 * * 5', async () => {
    console.log('[Scheduler] ⏰ Triggered: Weekly Newsletter Transmission @', new Date().toISOString());
    try {
      await dispatchNewsletter();
      console.log('[Scheduler] ✅ Weekly Newsletter transmission sequence complete.');
    } catch (err: any) {
      console.error('[Scheduler] ❌ Weekly Newsletter transmission failed:', err.message);
    }
  });
  console.log('[Scheduler] Registered: Weekly Newsletter Generator (Every Friday at 17:00)');
}
