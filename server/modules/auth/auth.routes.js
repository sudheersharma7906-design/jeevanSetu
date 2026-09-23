// server/modules/auth/auth.routes.js
import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { authLoginLimiter, authOtpRequestLimiter, authOtpVerifyLimiter } from '../../middleware/rateLimiter.js';
import { validateLogin, validateSignup, validateOtpRequest, validateOtpVerify } from '../../middleware/validator.js';

const router = Router();

// Primary Mobile + Password authentication & registration routes
router.post('/login', authLoginLimiter, validateLogin, AuthController.login);
router.post('/signup', authLoginLimiter, validateSignup, AuthController.signup);
router.post('/register', authLoginLimiter, validateSignup, AuthController.signup);

// Public OTP authentication routes (legacy fallback)
router.post('/otp/request', authOtpRequestLimiter, validateOtpRequest, AuthController.requestOtp);
router.post('/otp/verify', authOtpVerifyLimiter, validateOtpVerify, AuthController.verifyOtp);
router.post('/reset-password', authOtpRequestLimiter, AuthController.resetPassword);

// Session token management
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verifyToken);

// Authenticated current user profile
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
