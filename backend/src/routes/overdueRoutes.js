const express = require('express');
const router = express.Router();
const OverdueController = require('../controllers/overdueController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');

// Get overdue gatepasses for current user's role
router.get(
  '/my-overdue',
  authenticateToken,
  authorize(ROLES.SECURITY, ROLES.COORDINATOR, ROLES.WARDEN, ROLES.ADMIN),
  OverdueController.getOverdueForRole
);

// Get all overdue gatepasses (admin/security)
router.get(
  '/',
  authenticateToken,
  authorize(ROLES.SECURITY, ROLES.ADMIN),
  OverdueController.getOverdue
);

// Manually trigger overdue check (admin only)
router.post(
  '/check',
  authenticateToken,
  authorize(ROLES.ADMIN),
  OverdueController.checkOverdue
);

// Mark overdue as resolved (admin only)
router.post(
  '/:id/resolve',
  authenticateToken,
  authorize(ROLES.ADMIN),
  OverdueController.markResolved
);

module.exports = router;
