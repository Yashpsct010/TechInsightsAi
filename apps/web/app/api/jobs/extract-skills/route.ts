import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { extractTokenFromHeader, verifyToken } from '@/utils/jwt';
import { connectToDatabase, User } from '@techinsights/database';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const prompt = `You are an expert technical recruiter and resume analyzer.
Extract exactly the top 5 most important technical skills, roles, or job keywords from the attached resume.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of strings. Do not include markdown blocks, explanations, or any other text.
2. The items should be single terms or short phrases (e.g., "React", "Frontend Developer", "Machine Learning", "Python").
3. If the resume is empty or lacks skills, return an empty array [].`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200,
      },
    };

    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    const modelToUse = 'gemini-1.5-flash';

    const response = await axios.post(
      `${baseUrl}/${modelToUse}:generateContent?key=${geminiApiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    let skills: string[] = [];
    try {
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed)) {
        skills = parsed.slice(0, 5);
      }
    } catch {
      skills = [];
    }

    return NextResponse.json({
      success: true,
      skills,
    });
  } catch (error: any) {
    console.error('Extract Skills Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to extract skills from resume.' },
      { status: 500 }
    );
  }
}
