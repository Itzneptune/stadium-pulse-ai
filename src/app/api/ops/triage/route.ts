import { NextRequest, NextResponse } from 'next/server';
import { triageIncident } from '@/lib/gemini/triage';
import prisma from '@/lib/db';
import { simEngine } from '@/lib/simulation/engine';

export async function POST(req: NextRequest) {
  try {
    const { description, zoneId, reportedByRole } = await req.json();

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
