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
      static json(data: any, init?: any) {
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
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
  NextRequest: class NextRequest {
    body: any;
    constructor(url: string, init: any) {
      this.body = init.body;
    }
    async json() { return JSON.parse(this.body); }
  }
}), { virtual: true });
