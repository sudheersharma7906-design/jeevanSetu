// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';

// Security Middleware
import { securityHeaders, enforceHttps } from './middleware/security.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';

// Route modules
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import triageRoutes from './modules/triage/triage.routes.js';
import consultRoutes from './modules/consult/consult.routes.js';
import prescriptionRoutes from './modules/prescription/prescription.routes.js';
import recordRoutes from './modules/record/record.routes.js';
import emergencyRoutes from './modules/emergency/emergency.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

import { connectDB, disconnectDB, getDatabaseHealth } from './config/database.js';
import { UserController } from './modules/user/user.controller.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

// Production Environment Validation Helper
function validateEnvironment() {
  const isProd = process.env.NODE_ENV === 'production';
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    if (isProd) {
      console.error(`[CRITICAL] Missing required environment variables in production: ${missing.join(', ')}`);
      process.exit(1);
    } else {
      console.warn(`[WARN] Missing environment variables: ${missing.join(', ')}. Using development fallbacks.`);
    }
  }
}

validateEnvironment();

// Initialize Database connection
connectDB().catch(err => {
  console.warn('[MongoDB] Initialization notice:', err.message);
});

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Trust proxy for reverse proxies / load balancers (Render, Vercel, Railway, Nginx)
app.set('trust proxy', 1);

// 1. Response Compression (Gzip / Brotli)
app.use(compression({
  threshold: 1024, // Compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// 2. Security Headers & HTTPS enforcement
app.use(securityHeaders);
app.use(enforceHttps);

// 3. CORS configuration
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 4. Body parsers with payload limits to prevent buffer overflow attacks
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 5. Universal Input Sanitization (strips NoSQL injection operators and XSS)
app.use(sanitizeInput);

// 6. Global API Rate Limiter
app.use('/api', generalApiLimiter);

// 7. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Setup Real-time WebSockets
setupSocketHandlers(io);

// Root & Health Check Endpoints
app.get('/api/health', async (req, res) => {
  const dbHealth = await getDatabaseHealth();
  const memory = process.memoryUsage();

  res.status(200).json({
    status: 'healthy',
    service: 'JeevanSetu Rural Telemedicine & Emergency Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024))
    },
    database: dbHealth,
    securityBaseline: {
      jwtSessionAuth: 'active',
      passwordlessOtp: 'active',
      rbac: 'enforced',
      locationPrivacy: 'explicit SOS trigger only',
      inputSanitization: 'active',
      securityHeaders: 'enabled',
      compression: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Service Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/consult', consultRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Direct compatibility routes for patient self-service
app.get('/api/patients/me', authenticateToken, UserController.getPatientMe);
app.get('/api/patients/:id', UserController.getPatientById);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if run directly
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('server'));
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🏥 JeevanSetu Backend Gateway running on port ${PORT}`);
    console.log(`  🔒 Security Baseline: JWT, OTP, RBAC, Compression`);
    console.log(`  🌐 REST API Health: http://localhost:${PORT}/api/health`);
    console.log(`  ⚡ Socket.io Real-Time Engine active`);
    console.log(`=======================================================`);
  });
}

// Graceful Shutdown Handler for Container Orchestration (K8s / Docker / Cloud Run)
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] ${signal} signal received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('[Server] HTTP server closed to new incoming requests.');
    try {
      io.close(() => console.log('[Socket.io] Real-time gateway stopped.'));
      await disconnectDB();
      console.log('[Server] Graceful shutdown complete. Exiting process.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error during graceful shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcing shutdown.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { app, server, io };
