import dotenv from 'dotenv';
import path from 'path';

// Load .env from worker directory or root monorepo
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/techinsights',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  cronSecret: process.env.CRON_SECRET || 'dev_secret_key',
  clientUrl: process.env.CLIENT_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_APP_PASSWORD || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export function validateConfig() {
  if (!config.geminiApiKey) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set. AI content generation will fail.');
  }
  if (!config.unsplashAccessKey) {
    console.warn('⚠️ WARNING: UNSPLASH_ACCESS_KEY is not set. Fallback image placeholders will be used.');
  }
}
