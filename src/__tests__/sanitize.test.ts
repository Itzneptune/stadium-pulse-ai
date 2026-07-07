import { sanitize } from '@/lib/sanitize';

describe('sanitize', () => {
  it('removes basic HTML tags', () => {
    expect(sanitize('<b>Hello</b>')).toBe('Hello');
    expect(sanitize('<p>Test <br/> string</p>')).toBe('Test  string');
  });

  it('removes script tags and their content completely', () => {
    expect(sanitize('<script>alert("xss")</script>Hello')).toBe('Hello');
    expect(sanitize('Text<script src="bad.js"></script>Here')).toBe('TextHere');
  });

  it('removes control characters', () => {
    // \x00 is null, \x07 is bell
    expect(sanitize('Hello\x00World\x07')).toBe('HelloWorld');
  });

  it('handles empty strings gracefully', () => {
    expect(sanitize('')).toBe('');
  });

  it('handles strings with only tags gracefully', () => {
    expect(sanitize('<script>bad()</script>')).toBe('');
  });
});
