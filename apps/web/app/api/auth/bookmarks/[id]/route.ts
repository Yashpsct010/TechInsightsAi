import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, User } from '@techinsights/database';
import { extractTokenFromHeader, verifyToken } from '../../../../../utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const { id: blogId } = await params;
    if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
      return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const currentBookmarks = (user.bookmarks || []).map((b: any) =>
      typeof b === 'string' ? b : b.toString()
    );

    const isBookmarked = currentBookmarks.includes(blogId);

    if (isBookmarked) {
      user.bookmarks = (user.bookmarks as any).filter(
        (id: any) => id.toString() !== blogId
      );
    } else {
      (user.bookmarks as any).push(new mongoose.Types.ObjectId(blogId));
    }

    await user.save();

    const updatedBookmarks = (user.bookmarks as any).map((id: any) => id.toString());

    return NextResponse.json({
      message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
      bookmarks: updatedBookmarks,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/bookmarks/[id]:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
