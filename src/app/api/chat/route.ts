import { NextRequest, NextResponse } from 'next/server';
import { askPulse } from '@/lib/gemini/wayfinding';
import { globalRateLimiter } from '@/lib/rate-limit';
import { sanitize } from '@/lib/sanitize';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en', accessibilityMode = false, sessionId } = await req.json();

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!globalRateLimiter.check(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid string query is required' }, { status: 400 });
    }
    
    if (query.length > 500) {
      return NextResponse.json({ error: 'Query exceeds maximum length of 500 characters' }, { status: 400 });
    }
    
    const sanitizedQuery = sanitize(query);

    const aiResponse = await askPulse(sanitizedQuery, language, accessibilityMode);

    // If we have a sessionId, store the message (Mocking simple storage here for demo)
    if (sessionId) {
      await prisma.message.create({
        data: {
          sessionId,
          sender: 'USER',
          content: query,
        }
      });
      await prisma.message.create({
        data: {
          sessionId,
          sender: 'MODEL',
          content: aiResponse.message,
          routeData: JSON.stringify(aiResponse.route)
        }
      });
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error(error); return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
