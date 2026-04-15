const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// IMPORTANT: /read-all must be defined BEFORE /:id/read to avoid Express matching "read-all" as an id
router.put('/read-all', authenticateToken, NotificationController.markAllAsRead);
router.get('/', authenticateToken, NotificationController.getNotifications);
router.put('/:id/read', authenticateToken, NotificationController.markAsRead);

module.exports = router;
