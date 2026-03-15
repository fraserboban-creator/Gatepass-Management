const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('role').isIn(['student', 'coordinator', 'warden', 'security', 'admin']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('student_id').optional().trim(),
  body('hostel_block').optional().trim(),
  body('room_number').optional().trim()
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for gatepass creation
 */
const createGatepassValidation = [
  body('destination').trim().isLength({ min: 3 }).withMessage('Destination is required (minimum 3 characters)'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('leave_time').isISO8601().withMessage('Valid leave time is required'),
  body('expected_return_time').isISO8601().withMessage('Valid return time is required'),
  body('contact_number')
    .trim()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .isLength({ min: 10 })
    .withMessage('Valid contact number is required (at least 10 digits)')
];

/**
 * Validation rules for gatepass approval/rejection
 */
const approvalValidation = [
  body('action').optional().isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('comments').optional().trim()
];

/**
 * Validation rules for QR verification
 */
const qrVerifyValidation = [
  body('qrData').notEmpty().withMessage('QR data is required')
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  createGatepassValidation,
  approvalValidation,
  qrVerifyValidation,
  handleValidationErrors
};
