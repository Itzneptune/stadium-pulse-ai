import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { simulateWhatIf } from '@/lib/gemini/what-if';
import { sanitize } from '@/lib/sanitize';
import { globalRateLimiter } from '@/lib/rate-limit';

const WhatIfSchema = z.object({
  query: z.string({ required_error: 'Valid string query is required', invalid_type_error: 'Valid string query is required' }).min(1, 'Valid string query is required').max(250, 'Query exceeds maximum length of 250 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = WhatIfSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors?.[0]?.message || parsed.error.issues?.[0]?.message || 'Validation error' }, { status: 400 });
    }
    
    const { query } = parsed.data;
    
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!globalRateLimiter.check(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const sanitizedQuery = sanitize(query);
    const simulation = await simulateWhatIf(sanitizedQuery);
    
    if (simulation) {
      return NextResponse.json(simulation);
    }

    return NextResponse.json({ error: 'Failed to simulate scenario' }, { status: 500 });
  } catch (error) {
    console.error('What-If simulation error:', error);
    return NextResponse.json({ error: 'Failed to process what-if scenario' }, { status: 500 });
  }
}
