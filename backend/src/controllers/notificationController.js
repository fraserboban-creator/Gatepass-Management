const NotificationService = require('../services/notificationService');

class NotificationController {
  /**
   * Get notifications for current user
   */
  static getNotifications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      
      const result = NotificationService.getForUser(req.user.id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  static markAsRead(req, res, next) {
    try {
      const notificationId = parseInt(req.params.id);
      NotificationService.markAsRead(notificationId);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static markAllAsRead(req, res, next) {
    try {
      NotificationService.markAllAsRead(req.user.id);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
