import { NextRequest, NextResponse } from 'next/server';
import { askPulse } from '@/lib/gemini/wayfinding';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en', accessibilityMode = false, sessionId } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const aiResponse = await askPulse(query, language, accessibilityMode);

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
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
