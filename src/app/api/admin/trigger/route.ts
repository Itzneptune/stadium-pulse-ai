import { NextRequest, NextResponse } from 'next/server';
import { simEngine } from '@/lib/simulation/engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'SURGE') {
      const validPhases = ['PRE_MATCH', 'FIRST_HALF', 'HALFTIME', 'SECOND_HALF', 'POST_MATCH'];
      const phase = payload?.phase || 'HALFTIME';
      if (!validPhases.includes(phase)) {
        return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
      }
      simEngine.triggerSurge(phase as 'HALFTIME' | 'PRE_MATCH' | 'POST_MATCH');
      return NextResponse.json({ success: true, message: `Surge triggered for phase ${payload.phase}` });
    } 
    
    if (action === 'INCIDENT') {
      const description = payload?.description || 'System test incident';
      if (typeof description !== 'string' || description.length > 500) {
        return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
      }
      const incident = await simEngine.reportIncident(
        payload?.zoneId || 'gate-a',
        payload?.type || 'SECURITY',
        description,
        payload.role || 'SYSTEM'
      );
      return NextResponse.json({ success: true, incident });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Trigger error:', error);
    return NextResponse.json({ error: 'Failed to execute trigger' }, { status: 500 });
  }
}
