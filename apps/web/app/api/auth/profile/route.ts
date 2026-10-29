import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@techinsights/database';
import { extractTokenFromHeader, verifyToken } from '../../../../utils/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized, no token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized, invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.id).populate('bookmarks').lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      bookmarks: user.bookmarks,
      newsletterSubscribed: user.newsletterSubscribed,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/profile:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
