const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');

// Get dashboard analytics (role-aware)
router.get(
  '/dashboard',
  authenticateToken,
  AnalyticsController.getDashboardAnalytics
);

// Get global analytics (admin, coordinator, warden only)
router.get(
  '/global',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.WARDEN),
  AnalyticsController.getGlobalAnalytics
);

// Get student-specific analytics
router.get(
  '/student/:studentId',
  authenticateToken,
  AnalyticsController.getStudentAnalytics
);

// Get analytics filtered by student
router.get(
  '/student/:studentId/filtered',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.WARDEN),
  AnalyticsController.getAnalyticsByStudent
);

// Get top destinations
router.get(
  '/destinations',
  authenticateToken,
  AnalyticsController.getTopDestinations
);

// Get common reasons
router.get(
  '/reasons',
  authenticateToken,
  AnalyticsController.getCommonReasons
);

module.exports = router;
