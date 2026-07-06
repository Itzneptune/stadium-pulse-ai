import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
Object.defineProperty(global, 'TextDecoder', { value: TextDecoder });

// Mock Request, Response, Headers for Next.js API Route testing in jsdom
if (typeof Request === 'undefined') {
  Object.defineProperty(global, 'Request', { value: class Request {} });
}
if (typeof Response === 'undefined') {
  Object.defineProperty(global, 'Response', { 
    value: class Response {
      static json(data: unknown, init?: { status?: number }) {
        return {
          status: init?.status || 200,
          json: async () => data
        };
      }
    } 
  });
}
if (typeof Headers === 'undefined') {
  Object.defineProperty(global, 'Headers', { value: class Headers {} });
}

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => body
    }))
  },
  NextRequest: class NextRequest {
    body: string;
    headers: { get: (key: string) => string | null };
    constructor(url: string, init: { body: string, headers?: Record<string, string> }) {
      this.body = init.body;
      this.headers = {
        get: (key: string) => init.headers?.[key] || null
      };
    }
    async json() { return JSON.parse(this.body); }
  }
}), { virtual: true });
