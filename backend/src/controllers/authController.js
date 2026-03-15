const AuthService = require('../services/authService');

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
}

module.exports = AuthController;
