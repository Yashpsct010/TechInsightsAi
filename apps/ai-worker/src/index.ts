import { connectToDatabase } from '@techinsights/database';
import { validateConfig, config } from './config/env';
import { setupCronJobs } from './cron/scheduler';

async function bootstrap() {
  console.log('====================================================');
  console.log('   🤖 TechInsights AI Background Worker (v2.0)     ');
  console.log('====================================================');
  console.log(`[Worker] Environment: ${config.nodeEnv}`);
  console.log(`[Worker] Target Portal: ${config.clientUrl}`);
  validateConfig();

  try {
    console.log('[Worker] Establishing shared database connection pool...');
    await connectToDatabase();
    console.log('[Worker] ✅ Database connection established.');

    // Initialize cron jobs
    setupCronJobs();
    console.log('[Worker] 🚀 Autonomous Worker is live and operational.');

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`[Worker] Received ${signal}. Shutting down worker gracefully...`);
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error: any) {
    console.error('[Worker] ❌ Bootstrap failed:', error.message);
    process.exit(1);
  }
}

bootstrap();
