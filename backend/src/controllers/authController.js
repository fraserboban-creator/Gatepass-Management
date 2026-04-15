const AuthService = require('../services/authService');
const UserModel = require('../models/userModel');
const emailService = require('../services/emailService');
const crypto = require('crypto');

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout user
   */
  static logout(req, res) {
    // With JWT, logout is handled client-side by removing the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  /**
   * Get current user profile
   */
  static getProfile(req, res) {
    res.json({
      success: true,
      data: { user: req.user }
    });
  }

  /**
   * Forgot password — sends a reset link to the user's email
   */
  static async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Always return success to prevent email enumeration
    const user = UserModel.findByEmail(email);
    if (user) {
      // Generate a simple token (in production use a proper reset token table)
      const token = crypto.randomBytes(32).toString('hex');
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hi <strong>${user.full_name}</strong>,</p>
          <p>We received a request to reset your password for the Hostel Gatepass Management System.</p>
          <p>Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">Hostel Gatepass Management System</p>
        </div>
      `;

      await emailService.sendEmail(email, 'Reset Your Password', html);
    }

    // Always respond with success (don't reveal if email exists)
    return res.json({
      success: true,
      message: 'If that email exists in our system, a reset link has been sent.'
    });
  }
}

module.exports = AuthController;
