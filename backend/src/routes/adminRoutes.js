const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorize, ROLES } = require('../middleware/roleMiddleware');

// All admin routes require admin or warden role
router.get(
  '/users',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.WARDEN),
  AdminController.getUsers
);

router.post(
  '/users',
  authenticateToken,
  authorize(ROLES.ADMIN),
  AdminController.createUser
);

router.put(
  '/users/:id',
  authenticateToken,
  authorize(ROLES.ADMIN),
  AdminController.updateUser
);

router.patch(
  '/users/:id',
  authenticateToken,
  authorize(ROLES.ADMIN),
  AdminController.updateUser
);

router.post(
  '/users/:id/deactivate',
  authenticateToken,
  authorize(ROLES.ADMIN),
  AdminController.deactivateUser
);

router.post(
  '/users/:id/activate',
  authenticateToken,
  authorize(ROLES.ADMIN),
  AdminController.activateUser
);

router.delete(
  '/users/:id',
  authenticateToken,
  authorize(ROLES.ADMIN),
  AdminController.deleteUser
);

router.get(
  '/analytics',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.WARDEN, ROLES.COORDINATOR),
  AdminController.getAnalytics
);

router.get(
  '/logs',
  authenticateToken,
  authorize(ROLES.ADMIN, ROLES.WARDEN, ROLES.SECURITY),
  AdminController.getLogs
);

module.exports = router;
