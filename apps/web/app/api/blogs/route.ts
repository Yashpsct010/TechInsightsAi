import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, Blog } from '@techinsights/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '9', 10)));
    const genre = searchParams.get('genre');
    const preferredGenres = searchParams.get('preferredGenres');
    const searchTerm = searchParams.get('searchTerm');
    const dateFilter = searchParams.get('dateFilter');

    const query: Record<string, any> = {};

    if (genre && genre !== 'all') {
      query.genre = genre;
    } else if (preferredGenres) {
      const genresArray = preferredGenres.split(',').map((g) => g.trim()).filter(Boolean);
      if (genresArray.length > 0) {
        query.genre = { $in: genresArray };
      }
    }

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { body: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (dateFilter && dateFilter !== 'all') {
      const filterDate = new Date();
      if (dateFilter === 'week') {
        filterDate.setDate(filterDate.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(filterDate.getMonth() - 1);
      } else if (dateFilter === 'year') {
        filterDate.setFullYear(filterDate.getFullYear() - 1);
      }
      query.createdAt = { $gte: filterDate };
    }

    // Exclude body field for lightweight payload in list views
    const blogs = await Blog.find(query)
      .select('-body')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      blogs,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      totalCount: total,
    });
  } catch (error: any) {
    console.error('Error in /api/blogs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
