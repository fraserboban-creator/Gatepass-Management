const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const jwtConfig = require('../config/jwt');
const { sanitizeUser } = require('../utils/helpers');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    // Check if user already exists
    const existingUser = UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(userData.password, 10);

    // Create user
    const userId = UserModel.create({
      ...userData,
      password_hash
    });

    const user = UserModel.findById(userId);
    return sanitizeUser(user);
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return {
      token,
      user: sanitizeUser(user)
    };
  }

  /**
   * Verify token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = AuthService;
