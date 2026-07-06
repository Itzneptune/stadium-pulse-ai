import { NextRequest, NextResponse } from 'next/server';
import { simulateWhatIf } from '@/lib/gemini/triage';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const simulation = await simulateWhatIf(query);
    
    if (simulation) {
      return NextResponse.json(simulation);
    }

    return NextResponse.json({ error: 'Failed to simulate scenario' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process what-if scenario' }, { status: 500 });
  }
}
