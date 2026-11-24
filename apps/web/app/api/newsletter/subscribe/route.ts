import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@techinsights/database';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Valid email address required' }, { status: 400 });
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      user.newsletterSubscribed = true;
      await user.save();
    } else {
      // Create subscriber user node with generated secure hash
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        email: normalizedEmail,
        password: randomPassword,
        newsletterSubscribed: true,
        role: 'user',
        preferences: ['tech-news', 'ai-ml', 'coding'],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Node synchronized. Neural feed transmission link active.',
      email: user.email,
    });
  } catch (error: any) {
    console.error('Error in /api/newsletter/subscribe:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to synchronize newsletter subscription' },
      { status: 500 }
    );
  }
}
