const express = require('express');
const router = express.Router();
const VisitorPassController = require('../controllers/visitorPassController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');

// Student routes
router.post(
  '/create-student',
  authenticateToken,
  authorize(ROLES.STUDENT),
  VisitorPassController.createStudentPass
);

router.get(
  '/my-passes',
  authenticateToken,
  authorize(ROLES.STUDENT),
  VisitorPassController.getStudentPasses
);

// Security routes
router.post(
  '/create-security',
  authenticateToken,
  authorize(ROLES.SECURITY),
  VisitorPassController.createSecurityPass
);

router.post(
  '/record-entry',
  authenticateToken,
  authorize(ROLES.SECURITY),
  VisitorPassController.recordEntry
);

router.post(
  '/record-exit',
  authenticateToken,
  authorize(ROLES.SECURITY),
  VisitorPassController.recordExit
);

router.get(
  '/active',
  authenticateToken,
  authorize(ROLES.SECURITY, ROLES.ADMIN),
  VisitorPassController.getActiveVisitors
);

// Coordinator/Warden routes
router.get(
  '/pending',
  authenticateToken,
  authorize(ROLES.COORDINATOR, ROLES.WARDEN, ROLES.ADMIN),
  VisitorPassController.getPendingPasses
);

router.post(
  '/:id/approve',
  authenticateToken,
  authorize(ROLES.COORDINATOR, ROLES.WARDEN, ROLES.ADMIN),
  VisitorPassController.approvePass
);

router.post(
  '/:id/reject',
  authenticateToken,
  authorize(ROLES.COORDINATOR, ROLES.WARDEN, ROLES.ADMIN),
  VisitorPassController.rejectPass
);

// Admin and Security routes
router.get(
  '/all',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.SECURITY),
  VisitorPassController.getAllPasses
);

router.get(
  '/stats/today',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.SECURITY),
  VisitorPassController.getTodayStats
);

router.get(
  '/stats',
  authenticateToken,
  authorize(ROLES.ADMIN),
  VisitorPassController.getStats
);

router.get(
  '/search',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.SECURITY),
  VisitorPassController.search
);

// Common routes
router.get(
  '/:id',
  authenticateToken,
  VisitorPassController.getPassDetails
);

// QR Code routes
router.post(
  '/:id/qr',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.SECURITY, ROLES.COORDINATOR, ROLES.STUDENT),
  VisitorPassController.generateQR
);

router.post(
  '/qr/verify',
  authenticateToken,
  authorize(ROLES.SECURITY),
  VisitorPassController.verifyQR
);

module.exports = router;
