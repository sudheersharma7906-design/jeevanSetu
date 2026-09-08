// server/middleware/security.js

/**
 * Helmet-grade HTTP security headers middleware for JivanSetu.
 * Sets industry-standard HTTP response headers for defense against
 * XSS, Clickjacking, MIME-sniffing, and enforces HSTS.
 */
export function securityHeaders(req, res, next) {
  // Enforce HTTP Strict Transport Security (HSTS) - 1 year with subdomains
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking by disallowing embedding in foreign frames
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Legacy XSS filter protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features and sensors
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=(self)');

  // Content Security Policy (allows local assets, font CDNs, OpenStreetMap tiles)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.tile.osm.org https://unpkg.com; " +
    "connect-src 'self' http://localhost:* ws://localhost:* https://nominatim.openstreetmap.org; " +
    "frame-ancestors 'self';"
  );

  // Disable server technology fingerprinting
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Enforces HTTPS in production environments when behind load balancers/reverse proxies.
 */
export function enforceHttps(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
      const host = req.headers.host || req.hostname;
      return res.redirect(301, `https://${host}${req.url}`);
    }
  }
  next();
}
