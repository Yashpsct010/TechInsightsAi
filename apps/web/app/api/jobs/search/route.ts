import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { extractTokenFromHeader, verifyToken } from '@/utils/jwt';
import { connectToDatabase, User } from '@techinsights/database';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = searchParams.get('page') || '1';
    const employment_types = searchParams.get('employment_types');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
    }

    const rapidApiKey =
      process.env.RAPIDAPI_KEY || '83269ac3e2msh2954dabf39d0e4dp186d00jsn3f3249a2f36f';

    const params: Record<string, string> = {
      query,
      page: page.toString(),
      num_pages: '1',
    };

    if (employment_types) {
      params.employment_types = employment_types;
    }

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params,
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      timeout: 10000,
    });

    return NextResponse.json({
      success: true,
      data: response.data?.data || [],
    });
  } catch (error: any) {
    console.error('Job Search API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch jobs from the live feed.' },
      { status: 500 }
    );
  }
}
