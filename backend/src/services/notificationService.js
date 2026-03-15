const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const { ROLES } = require('../config/constants');

class NotificationService {
  /**
   * Create notification for a user
   */
  static create(userId, gatepassId, title, message, type = 'info') {
    return NotificationModel.create({
      user_id: userId,
      gatepass_id: gatepassId,
      title,
      message,
      type
    });
  }

  /**
   * Notify user
   */
  static notifyUser(userId, gatepassId, message, type = 'info') {
    return this.create(userId, gatepassId, 'Gatepass Update', message, type);
  }

  /**
   * Notify all coordinators
   */
  static notifyCoordinators(gatepassId, message) {
    const coordinators = UserModel.findByRole(ROLES.COORDINATOR);
    coordinators.forEach(coordinator => {
      this.create(coordinator.id, gatepassId, 'New Gatepass Request', message, 'info');
    });
  }

  /**
   * Notify all wardens
   */
  static notifyWardens(gatepassId, message) {
    const wardens = UserModel.findByRole(ROLES.WARDEN);
    wardens.forEach(warden => {
      this.create(warden.id, gatepassId, 'Gatepass Pending Approval', message, 'info');
    });
  }

  /**
   * Get notifications for user
   */
  static getForUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const notifications = NotificationModel.findByUserId(userId, limit, offset);
    const unreadCount = NotificationModel.countUnread(userId);
    
    return { notifications, unreadCount };
  }

  /**
   * Mark notification as read
   */
  static markAsRead(notificationId) {
    return NotificationModel.markAsRead(notificationId);
  }

  /**
   * Mark all as read for user
   */
  static markAllAsRead(userId) {
    return NotificationModel.markAllAsRead(userId);
  }
}

module.exports = NotificationService;
