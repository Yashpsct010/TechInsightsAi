import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@techinsights/database';
import { extractTokenFromHeader, verifyToken } from '../../../../utils/jwt';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { preferences, newsletterSubscribed } = body;

    if (preferences !== undefined && Array.isArray(preferences)) {
      user.preferences = preferences;
    }

    if (newsletterSubscribed !== undefined && typeof newsletterSubscribed === 'boolean') {
      user.newsletterSubscribed = newsletterSubscribed;
    }

    await user.save();

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences,
      newsletterSubscribed: user.newsletterSubscribed,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/preferences:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
