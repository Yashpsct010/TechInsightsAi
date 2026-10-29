import { NextResponse } from 'next/server';
import { connectToDatabase, Intel } from '@techinsights/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const latestIntel = await Intel.findOne()
      .sort({ displayDate: -1, createdAt: -1 })
      .lean();

    if (latestIntel) {
      return NextResponse.json({ success: true, intel: latestIntel });
    }

    return NextResponse.json({
      success: true,
      intel: {
        intelHook: 'CRITICAL ALERT: System intelligence is currently booting. Synchronizing secure link.',
        topic: 'System Status',
        referenceUrl: '',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/intel/today:', error);
    return NextResponse.json(
      {
        success: false,
        intel: {
          intelHook: 'Warning: Disconnected from central intelligence node. Establishing secure link.',
          topic: 'System Status',
          referenceUrl: '',
        },
      },
      { status: 200 }
    );
  }
}
