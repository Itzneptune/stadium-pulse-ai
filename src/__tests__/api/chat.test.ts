import { POST } from '../../app/api/chat/route';
import { NextRequest } from 'next/server';
import { globalRateLimiter } from '@/lib/rate-limit';
import { askPulse } from '@/lib/gemini/wayfinding';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      status: init?.status || 200,
      json: async () => body
    }))
  },
  NextRequest: class NextRequest {}
}));

jest.mock('@/lib/gemini/wayfinding', () => ({
  askPulse: jest.fn().mockResolvedValue({ message: 'Test response', route: ['gate-a'] })
}));
jest.mock('@/lib/rate-limit', () => ({
  globalRateLimiter: { check: jest.fn().mockReturnValue(true) }
}));
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: { message: { create: jest.fn().mockResolvedValue({}) } }
}));

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return {
    json: async () => body,
    headers: { get: () => '127.0.0.1' }
  } as unknown as NextRequest;
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (globalRateLimiter.check as jest.Mock).mockReturnValue(true);
  });

  it('returns 400 when query is missing', async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when query exceeds 500 chars', async () => {
    const req = createMockRequest({ query: 'a'.repeat(501) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    (globalRateLimiter.check as jest.Mock).mockReturnValue(false);
    const req = createMockRequest({ query: 'Hello' });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('returns successful AI response', async () => {
    const req = createMockRequest({ query: 'Where is Gate B?' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('Test response');
    expect(data.route).toEqual(['gate-a']);
    expect(askPulse).toHaveBeenCalledWith('Where is Gate B?', 'en', false);
  });

  it('saves message when sessionId is provided', async () => {
    const req = createMockRequest({ query: 'Where is Gate B?', sessionId: 'session-123' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const { default: prisma } = require('@/lib/db');
    expect(prisma.message.create).toHaveBeenCalledTimes(2);
  });

  it('returns 500 on internal error', async () => {
    (askPulse as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    const req = createMockRequest({ query: 'Hello' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
