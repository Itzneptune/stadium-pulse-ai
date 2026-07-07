import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/rate-limit', () => ({
  globalRateLimiter: {
    check: jest.fn(),
  },
}));

describe('Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/ops/incidents', { body: '' });
    const { globalRateLimiter } = require('@/lib/rate-limit');
    globalRateLimiter.check.mockReturnValue(true);
    process.env.ADMIN_SECRET = 'secret123';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows normal API requests', () => {
    const response = middleware(mockRequest);
    expect(response?.status).not.toBe(401);
    expect(response?.status).not.toBe(429);
  });

  it('blocks requests when rate limited', () => {
    const { globalRateLimiter } = require('@/lib/rate-limit');
    globalRateLimiter.check.mockReturnValue(false);
    
    const response = middleware(mockRequest) as NextResponse;
    expect(response.status).toBe(429);
  });

  it('blocks admin routes without secret in production', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: 'production' }
    });

    const adminReq = new NextRequest('http://localhost:3000/api/admin/trigger', { body: '' });
    const response = middleware(adminReq) as NextResponse;
    
    expect(response.status).toBe(401);

    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: originalEnv }
    });
  });

  it('allows admin routes with secret in production', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: 'production' }
    });

    const adminReq = new NextRequest('http://localhost:3000/api/admin/trigger', {
      body: '',
      headers: { 'x-admin-secret': 'secret123' }
    });
    const response = middleware(adminReq) as NextResponse;
    
    expect(response).toBeUndefined();

    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: originalEnv }
    });
  });
});
