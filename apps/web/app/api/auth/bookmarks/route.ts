import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@techinsights/database';
import { extractTokenFromHeader, verifyToken } from '../../../../utils/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
    const user = await User.findById(decoded.id).populate({
      path: 'bookmarks',
      select: 'title image imageAlt genre createdAt',
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.bookmarks || []);
  } catch (error: any) {
    console.error('Error in /api/auth/bookmarks:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}
