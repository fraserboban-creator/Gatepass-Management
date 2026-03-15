const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get student profile
router.get(
  '/:studentId/profile',
  authenticateToken,
  AnalyticsController.getStudentProfile
);

// Get student gatepass history
router.get(
  '/:studentId/history',
  authenticateToken,
  AnalyticsController.getStudentHistory
);

module.exports = router;
