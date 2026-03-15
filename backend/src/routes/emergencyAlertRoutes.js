import express from 'express';
import { emergencyAlertController } from '../controllers/emergencyAlertController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create emergency alert (students only)
router.post(
  '/alert',
  authMiddleware,
  roleMiddleware(['student']),
  emergencyAlertController.createAlert
);

// Get active alerts (security, warden, coordinator, admin)
router.get(
  '/active',
  authMiddleware,
  roleMiddleware(['security', 'warden', 'coordinator', 'admin']),
  emergencyAlertController.getActiveAlerts
);

// Get all alerts with pagination (security, warden, coordinator, admin)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['security', 'warden', 'coordinator', 'admin']),
  emergencyAlertController.getAllAlerts
);

// Get alert by ID (security, warden, coordinator, admin)
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['security', 'warden', 'coordinator', 'admin']),
  emergencyAlertController.getAlertById
);

// Resolve alert (security, warden, admin)
router.patch(
  '/:id/resolve',
  authMiddleware,
  roleMiddleware(['security', 'warden', 'admin']),
  emergencyAlertController.resolveAlert
);

// Get student alerts (students can view their own, others need admin/security)
router.get(
  '/student/:studentId',
  authMiddleware,
  emergencyAlertController.getStudentAlerts
);

// Get active alerts count (security, warden, coordinator, admin)
router.get(
  '/count/active',
  authMiddleware,
  roleMiddleware(['security', 'warden', 'coordinator', 'admin']),
  emergencyAlertController.getActiveAlertsCount
);

export default router;
