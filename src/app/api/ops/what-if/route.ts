import { NextRequest, NextResponse } from 'next/server';
import { simulateWhatIf } from '@/lib/gemini/triage';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid string query is required' }, { status: 400 });
    }
    if (query.length > 250) {
      return NextResponse.json({ error: 'Query exceeds maximum length of 250 characters' }, { status: 400 });
    }

    const simulation = await simulateWhatIf(query);
    
    if (simulation) {
      return NextResponse.json(simulation);
    }

    return NextResponse.json({ error: 'Failed to simulate scenario' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process what-if scenario' }, { status: 500 });
  }
}
