import { connectToDatabase, Intel } from '@techinsights/database';
import { getAiGeneratedIntel } from './geminiService';

export async function generateDailyIntel(force: boolean = false) {
  await connectToDatabase();
  console.log('[IntelGenerator] Starting Daily Intel generation...');

  const todayStr = new Date().toISOString().split('T')[0];

  if (!force) {
    const existing = await Intel.findOne({ displayDate: todayStr });
    if (existing) {
      console.log(`[IntelGenerator] Daily Intel for ${todayStr} already exists [ID: ${existing._id}]. Skipping.`);
      return existing;
    }
  }

  const { intelHook, referenceUrl, topic } = await getAiGeneratedIntel();

  const intel = new Intel({
    intelHook,
    referenceUrl,
    topic,
    displayDate: todayStr,
    scratchedCount: 0,
  });

  await intel.save();
  console.log(`[IntelGenerator] ✅ Generated Daily Intel for ${todayStr}: "${intelHook.substring(0, 60)}..."`);
  return intel;
}
