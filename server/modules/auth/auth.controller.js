// server/modules/auth/auth.controller.js
import { AuthService } from './auth.service.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { phone, password, role } = req.body;
      const result = await AuthService.login(phone, password, role);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      let statusCode = 400;
      if (err.message.includes('Invalid credentials') || err.message.includes('not found') || err.message.includes('Incorrect password')) {
        statusCode = 401;
      } else if (err.message.includes('role') || err.message.includes('mismatch')) {
        statusCode = 403;
      }
      res.status(statusCode).json({
        success: false,
        error: err.message
      });
    }
  }

  static async signup(req, res) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async requestOtp(req, res) {
    try {
      const { phone, role, name } = req.body;
      const result = AuthService.requestOtp(phone, role, name);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async verifyOtp(req, res) {
    try {
      const { phone, otp } = req.body;
      const result = await AuthService.verifyOtp(phone, otp);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = req.body?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);
      const result = await AuthService.refreshToken(token);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        error: err.message
      });
    }
  }

  static async logout(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = req.body?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);
      const result = AuthService.logout(token);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  static async verifyToken(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = req.query?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);
      const result = await AuthService.verifyToken(token);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        error: err.message
      });
    }
  }

  static async getMe(req, res) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        user
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { phone, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword(phone, otp, newPassword);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}
