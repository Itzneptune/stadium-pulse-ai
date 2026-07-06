export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(ip: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(ip) || [];
    
    // Clean up old timestamps
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    
    if (validTimestamps.length >= this.maxRequests) {
      this.requests.set(ip, validTimestamps);
      return false; // Rate limited
    }
    
    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);
    return true; // Allowed
  }
}

// Global instance for simple in-memory rate limiting across the app
export const globalRateLimiter = new RateLimiter();
