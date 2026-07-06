import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Prisma Error:', error);
    return NextResponse.json([]);
  }
}
