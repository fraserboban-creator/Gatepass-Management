const express = require('express');
const router = express.Router();
const GatepassController = require('../controllers/gatepassController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');
const { createGatepassValidation, approvalValidation, handleValidationErrors } = require('../utils/validation');

// Student routes
router.post(
  '/create',
  authenticateToken,
  authorize(ROLES.STUDENT),
  createGatepassValidation,
  handleValidationErrors,
  GatepassController.create
);

router.get(
  '/history',
  authenticateToken,
  authorize(ROLES.STUDENT),
  GatepassController.getHistory
);

router.delete(
  '/:id',
  authenticateToken,
  authorize(ROLES.STUDENT),
  GatepassController.deleteGatepass
);

// Coordinator and Warden routes
router.get(
  '/pending',
  authenticateToken,
  authorize(ROLES.COORDINATOR, ROLES.WARDEN),
  GatepassController.getPending
);

router.get(
  '/all',
  authenticateToken,
  authorize(ROLES.COORDINATOR, ROLES.WARDEN, ROLES.ADMIN),
  GatepassController.getAllGatepasses
);

router.post(
  '/:id/approve',
  authenticateToken,
  authorize(ROLES.COORDINATOR, ROLES.WARDEN),
  approvalValidation,
  handleValidationErrors,
  GatepassController.approve
);

// Security routes
router.post(
  '/:id/exit',
  authenticateToken,
  authorize(ROLES.SECURITY),
  GatepassController.markExit
);

router.post(
  '/:id/return',
  authenticateToken,
  authorize(ROLES.SECURITY),
  GatepassController.markReturn
);

// Common routes
router.get(
  '/:id',
  authenticateToken,
  GatepassController.getDetails
);

module.exports = router;
