import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { askPulse } from '@/lib/gemini/wayfinding';
import { globalRateLimiter } from '@/lib/rate-limit';
import { sanitize } from '@/lib/sanitize';
import prisma from '@/lib/db';

const ChatSchema = z.object({
  query: z.string({ required_error: 'Valid string query is required', invalid_type_error: 'Valid string query is required' }).min(1, 'Valid string query is required').max(500, 'Query exceeds maximum length of 500 characters'),
  language: z.string().optional().default('en'),
  accessibilityMode: z.boolean().optional().default(false),
  sessionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors?.[0]?.message || parsed.error.issues?.[0]?.message || 'Validation error' }, { status: 400 });
    }
    
    const { query, language, accessibilityMode, sessionId } = parsed.data;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!globalRateLimiter.check(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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
