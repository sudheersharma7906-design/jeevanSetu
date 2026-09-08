// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

import { connectDB } from './config/database.js';
import { UserController } from './modules/user/user.controller.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

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

// 1. Security Headers & HTTPS enforcement
app.use(securityHeaders);
app.use(enforceHttps);

// 2. CORS configuration
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Body parsers with payload limits to prevent buffer overflow attacks
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Universal Input Sanitization (strips NoSQL injection operators and XSS)
app.use(sanitizeInput);

// 5. Global API Rate Limiter
app.use('/api', generalApiLimiter);

// 6. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Setup Real-time WebSockets
setupSocketHandlers(io);

// Root & Health Check Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'JeevanSetu Rural Telemedicine & Emergency Backend',
    version: '1.0.0',
    securityBaseline: {
      jwtSessionAuth: 'active (short-lived access tokens)',
      passwordlessOtp: 'active (brute-force defense & single-use)',
      rbac: 'enforced (patient isolation & clinical jurisdiction)',
      locationPrivacy: 'explicit SOS trigger only (zero continuous tracking)',
      inputSanitization: 'active (NoSQL injection & XSS neutralised)',
      securityHeaders: 'HSTS, nosniff, X-Frame-Options, CSP enabled'
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

import { authenticateToken } from './middleware/auth.js';

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
    console.log(`  🔒 MVP Security Baseline: JWT, OTP, RBAC, Sanitized`);
    console.log(`  🌐 REST API: http://localhost:${PORT}/api/health`);
    console.log(`  ⚡ Socket.io Real-Time Engine active`);
    console.log(`=======================================================`);
  });
}

export { app, server, io };
