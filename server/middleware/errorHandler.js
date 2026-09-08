// server/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  console.error('[Error caught by global handler]:', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
}
