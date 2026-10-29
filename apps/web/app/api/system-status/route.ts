import { NextResponse } from 'next/server';
import { connectToDatabase, Blog, User, isDatabaseConnected } from '@techinsights/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const [totalBlogs, totalUsers, latestBlog, genresAgg] = await Promise.all([
      Blog.countDocuments(),
      User.countDocuments(),
      Blog.findOne().sort({ createdAt: -1 }).select('createdAt title').lean(),
      Blog.aggregate([
        { $group: { _id: '$genre', count: { $sum: 1 } } }
      ]),
    ]);

    const blogsByGenre: Record<string, number> = {};
    genresAgg.forEach((item: any) => {
      if (item._id) blogsByGenre[item._id] = item.count;
    });

    return NextResponse.json({
      status: 'healthy',
      databaseConnected: isDatabaseConnected(),
      totalBlogs,
      totalUsers,
      latestBlogPublishedAt: latestBlog?.createdAt || null,
      blogsByGenre,
      environment: process.env.NODE_ENV || 'production',
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (error: any) {
    console.error('Error in /api/system-status:', error);
    return NextResponse.json(
      {
        status: 'degraded',
        databaseConnected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
