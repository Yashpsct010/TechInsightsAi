import { dispatchNewsletter } from '../services/newsletterService';
import { validateConfig } from '../config/env';

async function main() {
  validateConfig();

  console.log('[Script] Launching manual newsletter transmission sequence...');
  try {
    const result = await dispatchNewsletter();
    console.log(`[Script] ✅ Newsletter complete: ${result.success} delivered, ${result.failed} failed.`);
    process.exit(0);
  } catch (error: any) {
    console.error('[Script] ❌ Newsletter transmission failed:', error);
    process.exit(1);
  }
}

main();
