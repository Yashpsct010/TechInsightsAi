import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, User } from '@techinsights/database';
import { generateToken } from '../../../../utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid or missing JSON payload' }, { status: 400 });
    }
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      preferences: user.preferences,
      bookmarks: user.bookmarks,
      newsletterSubscribed: user.newsletterSubscribed,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
