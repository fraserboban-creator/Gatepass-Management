const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { registerValidation, loginValidation, handleValidationErrors } = require('../utils/validation');

// Public routes
router.post('/register', registerValidation, handleValidationErrors, AuthController.register);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, AuthController.login);

// Protected routes
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
