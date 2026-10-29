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

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
    });

    return NextResponse.json(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        bookmarks: user.bookmarks,
        newsletterSubscribed: user.newsletterSubscribed,
        token: generateToken(user._id.toString()),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/auth/register:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
