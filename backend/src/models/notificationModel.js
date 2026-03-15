const { db } = require('../config/database');

class NotificationModel {
  /**
   * Create notification
   */
  static create(notificationData) {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, gatepass_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      notificationData.user_id,
      notificationData.gatepass_id || null,
      notificationData.title,
      notificationData.message,
      notificationData.type || 'info'
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Get notifications for a user
   */
  static findByUserId(userId, limit = 20, offset = 0) {
    return db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);
  }

  /**
   * Get unread notifications
   */
  static getUnread(userId) {
    return db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? AND is_read = 0 
      ORDER BY created_at DESC
    `).all(userId);
  }

  /**
   * Mark as read
   */
  static markAsRead(id) {
    return db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  }

  /**
   * Mark all as read for user
   */
  static markAllAsRead(userId) {
    return db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  }

  /**
   * Count unread notifications
   */
  static countUnread(userId) {
    return db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
      .get(userId).count;
  }
}

module.exports = NotificationModel;
