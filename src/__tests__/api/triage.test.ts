import { POST } from '../../app/api/ops/triage/route';
import { NextRequest } from 'next/server';
import { globalRateLimiter } from '@/lib/rate-limit';
import { triageIncident } from '@/lib/gemini/triage';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      status: init?.status || 200,
      json: async () => body
    }))
  },
  NextRequest: class NextRequest {}
}));

jest.mock('@/lib/gemini/triage', () => ({
  triageIncident: jest.fn().mockResolvedValue({
    title: 'Test Incident', type: 'MEDICAL', priority: 'HIGH',
    summary: 'Test summary', actionPlan: 'Step 1'
  })
}));
jest.mock('@/lib/rate-limit', () => ({
  globalRateLimiter: { check: jest.fn().mockReturnValue(true) }
}));
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: { incident: { create: jest.fn().mockResolvedValue({ id: 'inc-1', title: 'Test' }) } }
}));
jest.mock('@/lib/simulation/engine', () => ({
  simEngine: { getState: jest.fn().mockReturnValue({ activeIncidentIds: [] }) }
}));

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return {
    json: async () => body,
    headers: { get: () => '127.0.0.1' }
  } as unknown as NextRequest;
}

describe('POST /api/ops/triage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (globalRateLimiter.check as jest.Mock).mockReturnValue(true);
    (triageIncident as jest.Mock).mockResolvedValue({
      title: 'Test Incident', type: 'MEDICAL', priority: 'HIGH',
      summary: 'Test summary', actionPlan: 'Step 1'
    });
  });

  it('returns 400 when description is missing', async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when description exceeds 1000 chars', async () => {
    const req = createMockRequest({ description: 'a'.repeat(1001) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    (globalRateLimiter.check as jest.Mock).mockReturnValue(false);
    const req = createMockRequest({ description: 'Help!' });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('returns successful triage with incident', async () => {
    const req = createMockRequest({ description: 'Help!', zoneId: 'gate-a' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.incident.id).toBe('inc-1');
  });

  it('returns 500 when triage returns null', async () => {
    (triageIncident as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ description: 'Help!' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
