import { NextRequest, NextResponse } from 'next/server';
import { triageIncident } from '@/lib/gemini/triage';
import { globalRateLimiter } from '@/lib/rate-limit';
import prisma from '@/lib/db';
import { simEngine } from '@/lib/simulation/engine';

export async function POST(req: NextRequest) {
  try {
    const { description, zoneId, reportedByRole } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!globalRateLimiter.check(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Valid string description is required' }, { status: 400 });
    }
    if (description.length > 1000) {
      return NextResponse.json({ error: 'Description exceeds maximum length of 1000 characters' }, { status: 400 });
    }
    if (zoneId && typeof zoneId !== 'string') {
      return NextResponse.json({ error: 'Invalid zoneId format' }, { status: 400 });
    }

    const aiTriage = await triageIncident(description);
    
    if (aiTriage) {
      const incident = await prisma.incident.create({
        data: {
          title: aiTriage.title,
          type: aiTriage.type,
          description,
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
    return NextResponse.json({ error: 'Failed to process triage' }, { status: 500 });
  }
}
