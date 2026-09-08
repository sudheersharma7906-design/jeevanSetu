// server/middleware/rateLimiter.js

class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60 * 1000; // default 1 minute
    this.maxRequests = options.maxRequests || 100; // max requests per window
    this.message = options.message || 'Too many requests. Please try again later.';
    this.keyGenerator = options.keyGenerator || ((req) => req.ip || req.headers['x-forwarded-for'] || 'unknown-ip');
    this.hits = new Map();

    // Periodic cleanup of stale entries every 2 minutes
    setInterval(() => this.cleanup(), 2 * 60 * 1000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(ts => now - ts < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const key = this.keyGenerator(req);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      let timestamps = this.hits.get(key) || [];
      // Filter timestamps within current sliding window
      timestamps = timestamps.filter(ts => ts > windowStart);

      if (timestamps.length >= this.maxRequests) {
        const oldest = timestamps[0];
        const retryAfterSec = Math.ceil((oldest + this.windowMs - now) / 1000);
        res.setHeader('Retry-After', retryAfterSec);
        return res.status(429).json({
          success: false,
          error: this.message,
          retryAfterSeconds: retryAfterSec
        });
      }

      timestamps.push(now);
      this.hits.set(key, timestamps);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - timestamps.length));

      next();
    };
  }
}

/**
 * General API Rate Limiter: 120 requests per minute per IP
 */
export const generalApiLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit exceeded. Please slow down your requests.'
}).middleware();

/**
 * Auth Login Rate Limiter: Max 20 login attempts per 5 minutes per phone/IP
 * Protects password authentication from automated brute-force attacks.
 */
export const authLoginLimiter = new SlidingWindowRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
  keyGenerator: (req) => {
    const phone = req.body?.phone ? req.body.phone.replace(/\D/g, '').slice(-10) : '';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'ip';
    return `login-req:${phone || ip}`;
  },
  message: 'Too many login attempts. Please wait 5 minutes before trying again.'
}).middleware();

/**
 * Auth OTP Request Rate Limiter: Max 5 requests per 10 minutes per phone/IP
 * Prevents SMS bombing and OTP harvesting.
 */
export const authOtpRequestLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => {
    const phone = req.body?.phone ? req.body.phone.replace(/\D/g, '').slice(-10) : '';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'ip';
    return `otp-req:${phone || ip}`;
  },
  message: 'Too many OTP requests for this number. Please wait 10 minutes before requesting another OTP.'
}).middleware();

/**
 * Auth OTP Verification Attempt Limiter: Max 10 attempts per 5 minutes per phone
 * Prevents automated brute-force attacks against 6-digit verification codes.
 */
export const authOtpVerifyLimiter = new SlidingWindowRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req) => {
    const phone = req.body?.phone ? req.body.phone.replace(/\D/g, '').slice(-10) : '';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'ip';
    return `otp-ver:${phone || ip}`;
  },
  message: 'Excessive verification attempts. Please wait 5 minutes before trying again.'
}).middleware();

/**
 * Emergency SOS Rate Limiter: Max 5 triggers per 2 minutes per patient
 * Protects emergency broadcast gateways from spam flooding while permitting rapid retries.
 */
export const sosRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 2 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => {
    const patientId = req.body?.patientId || req.user?.id || req.ip;
    return `sos-trig:${patientId}`;
  },
  message: 'Emergency trigger rate limit reached. Active emergency responder has already been dispatched.'
}).middleware();
