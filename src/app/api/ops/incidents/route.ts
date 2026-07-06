import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        priority: true,
        zoneId: true,
        createdAt: true,
      }
    });
    return NextResponse.json(incidents, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Failed to fetch incidents:', error);
    return NextResponse.json([]);
  }
}
