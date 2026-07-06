import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { triageIncident } from '@/lib/gemini/triage';
import { globalRateLimiter } from '@/lib/rate-limit';
import { sanitize } from '@/lib/sanitize';
import prisma from '@/lib/db';
import { simEngine } from '@/lib/simulation/engine';

const TriageSchema = z.object({
  description: z.string({ required_error: 'Valid string description is required', invalid_type_error: 'Valid string description is required' }).min(1, 'Valid string description is required').max(1000, 'Description exceeds maximum length of 1000 characters'),
  zoneId: z.string().optional(),
  reportedByRole: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TriageSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors?.[0]?.message || parsed.error.issues?.[0]?.message || 'Validation error' }, { status: 400 });
    }
    
    const { description, zoneId, reportedByRole } = parsed.data;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!globalRateLimiter.check(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    const sanitizedDescription = sanitize(description);

    const aiTriage = await triageIncident(sanitizedDescription);
    
    if (aiTriage) {
      const incident = await prisma.incident.create({
        data: {
          title: aiTriage.title,
          type: aiTriage.type,
          description: sanitizedDescription,
          zoneId: zoneId || 'unknown',
          status: 'OPEN',
          priority: aiTriage.priority,
          reportedByRole: reportedByRole || 'SYSTEM',
          aiSummary: aiTriage.summary,
          aiActionPlan: aiTriage.actionPlan
        }
      });
      
      // Notify simulation engine
      simEngine.getState().activeIncidentIds.push(incident.id);
      
      return NextResponse.json({ success: true, incident });
    }

    return NextResponse.json({ error: 'Failed to triage incident' }, { status: 500 });
  } catch (error) {
    console.error('Triage error:', error);
    return NextResponse.json({ error: 'Failed to process triage' }, { status: 500 });
  }
}
