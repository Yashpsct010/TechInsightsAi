import { generateDailyIntel } from '../services/intelGenerator';
import { validateConfig } from '../config/env';

async function main() {
  validateConfig();

  const force = process.argv.includes('--force');

  console.log(`[Script] Launching Daily Intel generation (Force: ${force})...`);
  try {
    const intel = await generateDailyIntel(force);
    console.log(`[Script] ✅ Intel ready: "${intel.intelHook}" [ID: ${intel._id}]`);
    process.exit(0);
  } catch (error: any) {
    console.error('[Script] ❌ Daily Intel generation failed:', error);
    process.exit(1);
  }
}

main();
