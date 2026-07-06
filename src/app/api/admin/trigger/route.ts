import { NextRequest, NextResponse } from 'next/server';
import { simEngine } from '@/lib/simulation/engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'SURGE') {
      simEngine.triggerSurge(payload.phase || 'HALFTIME');
      return NextResponse.json({ success: true, message: `Surge triggered for phase ${payload.phase}` });
    } 
    
    if (action === 'INCIDENT') {
      const incident = await simEngine.reportIncident(
        payload.zoneId || 'gate-a',
        payload.type || 'SECURITY',
        payload.description || 'System test incident',
        payload.role || 'SYSTEM'
      );
      return NextResponse.json({ success: true, incident });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to execute trigger' }, { status: 500 });
  }
}
