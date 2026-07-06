import { NextResponse } from 'next/server';
import { generateCrowdAdvisories } from '@/lib/gemini/advisory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const advisories = await generateCrowdAdvisories();
    return NextResponse.json(advisories || { fanAdvisory: "All clear.", staffAlerts: [] }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Failed to fetch advisory:', error);
    return NextResponse.json({ error: 'Failed to generate advisories' }, { status: 500 });
  }
}
