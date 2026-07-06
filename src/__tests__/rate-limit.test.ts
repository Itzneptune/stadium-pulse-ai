import { RateLimiter } from '../lib/rate-limit';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows requests within the limit', () => {
    limiter = new RateLimiter(3, 1000);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(true);
  });

  it('blocks requests exceeding the limit', () => {
    limiter = new RateLimiter(3, 1000);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(false); // 4th request blocked
  });

  it('tracks different IPs independently', () => {
    limiter = new RateLimiter(2, 1000);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip2')).toBe(true);
    expect(limiter.check('ip2')).toBe(true);
    
    expect(limiter.check('ip1')).toBe(false);
    expect(limiter.check('ip2')).toBe(false);
  });

  it('resets after window expires', () => {
    limiter = new RateLimiter(1, 100);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(false);

    // Advance time beyond window
    jest.advanceTimersByTime(150);

    expect(limiter.check('ip1')).toBe(true);
  });

  it('cleans up expired timestamps', () => {
    limiter = new RateLimiter(2, 100);
    expect(limiter.check('ip1')).toBe(true);
    
    // Advance partially
    jest.advanceTimersByTime(50);
    expect(limiter.check('ip1')).toBe(true);
    expect(limiter.check('ip1')).toBe(false);

    // Advance so only the first request expires
    jest.advanceTimersByTime(60); 
    // Now total time elapsed is 110. The first request at t=0 is expired. The second at t=50 is not.
    // Limit is 2. There is currently 1 valid request.
    expect(limiter.check('ip1')).toBe(true);
  });

  it('resets the rate limiter', () => {
    limiter = new RateLimiter(1, 100);
    limiter.check('ip1');
    expect(limiter.check('ip1')).toBe(false);
    limiter.reset();
    expect(limiter.check('ip1')).toBe(true);
  });
});
