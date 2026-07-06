import { NextRequest, NextResponse } from 'next/server';
import { globalRateLimiter } from '@/lib/rate-limit';

/**
 * Next.js Middleware — centralized security layer.
 * Applies rate limiting to all API routes and blocks unauthenticated admin access.
 */
export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Rate-limit all API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    if (!globalRateLimiter.check(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Protect admin endpoint — require a secret header in production
  if (pathname.startsWith('/api/admin/')) {
    const adminSecret = request.headers.get('x-admin-secret');
    if (process.env.NODE_ENV === 'production' && adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
