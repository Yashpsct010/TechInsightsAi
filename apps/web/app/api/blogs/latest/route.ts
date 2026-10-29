import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Blog } from '@techinsights/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');

    const query: Record<string, any> = {};
    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    const latestBlog = await Blog.findOne(query).sort({ createdAt: -1 }).lean();

    if (!latestBlog) {
      return NextResponse.json({ error: 'No blog posts found.' }, { status: 404 });
    }

    return NextResponse.json({ blog: latestBlog });
  } catch (error: any) {
    console.error('Error in /api/blogs/latest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
