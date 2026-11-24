import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'default', speed = 1.0 } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ message: 'Text input is required' }, { status: 400 });
    }

    const voiceStudioBaseUrl = process.env.VOICESTUDIO_BASE_URL;

    if (!voiceStudioBaseUrl) {
      // VoiceStudio server not configured, signal client to use browser Neural Web Speech API fallback
      return NextResponse.json({
        available: false,
        engine: 'web-speech-fallback',
        message: 'VoiceStudio local API not configured. Falling back to browser Neural Web Speech API.',
      });
    }

    // Call VoiceStudio OpenAI-compatible audio endpoint POST /v1/audio/speech or /audio/speech
    const cleanUrl = voiceStudioBaseUrl.replace(/\/+$/, '');
    const endpoint = cleanUrl.includes('/v1')
      ? `${cleanUrl}/audio/speech`
      : `${cleanUrl}/v1/audio/speech`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const voiceStudioRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.VOICESTUDIO_API_KEY
          ? { Authorization: `Bearer ${process.env.VOICESTUDIO_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: text.slice(0, 4000), // Clip for TTS safety
        response_format: 'mp3',
        speed,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!voiceStudioRes.ok) {
      throw new Error(`VoiceStudio returned status ${voiceStudioRes.status}`);
    }

    const audioBuffer = await voiceStudioRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.warn('[VoiceStudio Audio Proxy] Offline or unreachable, signaling Web Speech fallback:', error.message);
    return NextResponse.json({
      available: false,
      engine: 'web-speech-fallback',
      message: 'VoiceStudio connection timed out or offline. Using browser Neural Web Speech API.',
    });
  }
}
