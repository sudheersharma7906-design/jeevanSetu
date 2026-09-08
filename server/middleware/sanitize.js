// server/middleware/sanitize.js

/**
 * Escapes potentially dangerous characters in strings to prevent XSS.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip <script> blocks
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // strip <iframe> blocks
    .replace(/javascript:/gi, '') // strip javascript: protocol
    .replace(/on\w+\s*=/gi, '') // strip inline event handlers (onerror=, onclick=)
    .trim();
}

/**
 * Recursively cleans objects and arrays:
 * 1. Strips MongoDB NoSQL query injection keys starting with '$' or containing '.'
 * 2. Sanitizes all nested string values against XSS and control characters
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      // Reject or strip NoSQL injection operators ($gt, $ne, $where, etc.) and dot-notation keys
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      clean[key] = sanitizeObject(value);
    }
    return clean;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

/**
 * Express 5 compatible middleware for universal deep request sanitization.
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    const cleanQuery = sanitizeObject({ ...req.query });
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, cleanQuery);
  }
  if (req.params && typeof req.params === 'object') {
    const cleanParams = sanitizeObject({ ...req.params });
    for (const key of Object.keys(req.params)) {
      delete req.params[key];
    }
    Object.assign(req.params, cleanParams);
  }
  next();
}
