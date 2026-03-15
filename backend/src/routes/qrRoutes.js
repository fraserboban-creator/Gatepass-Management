const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qrController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');
const { qrVerifyValidation, handleValidationErrors } = require('../utils/validation');

// Generate QR code (student can view their own)
router.get(
  '/generate/:gatepass_id',
  authenticateToken,
  QRController.generate
);

// Verify QR code (security only)
router.post(
  '/verify',
  authenticateToken,
  authorize(ROLES.SECURITY),
  qrVerifyValidation,
  handleValidationErrors,
  QRController.verify
);

module.exports = router;
