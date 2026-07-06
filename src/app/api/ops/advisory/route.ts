import { NextResponse } from 'next/server';
import { generateCrowdAdvisories } from '@/lib/gemini/advisory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const advisories = await generateCrowdAdvisories();
    return NextResponse.json(advisories || { fanAdvisory: "All clear.", staffAlerts: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate advisories' }, { status: 500 });
  }
}
