import { NextResponse } from 'next/server';
import { generateShiftReport } from '@/lib/gemini/shift-report';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await generateShiftReport();
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Shift report generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate shift report' }, { status: 500 });
  }
}
