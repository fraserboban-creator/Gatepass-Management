const GatepassModel = require('../models/gatepassModel');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const { db } = require('../config/database');

class OverdueService {
  /**
   * Check for overdue gatepasses and mark them
   * Runs periodically to detect students who haven't returned on time
   */
  static checkAndMarkOverdue() {
    try {
      const now = new Date().toISOString();
      
      // Find gatepasses that are overdue
      const overdueGatepasses = db.prepare(`
        SELECT g.*, u.full_name as student_name, u.student_id as student_roll
        FROM gatepasses g
        JOIN users u ON g.student_id = u.id
        WHERE g.status = 'approved'
        AND g.actual_return_time IS NULL
        AND g.expected_return_time < ?
        AND g.is_overdue = 0
      `).all(now);

      if (overdueGatepasses.length === 0) {
        return { marked: 0, notified: 0 };
      }

      let markedCount = 0;
      let notifiedCount = 0;

      // Mark each overdue gatepass and notify authorities
      for (const gatepass of overdueGatepasses) {
        // Mark as overdue
        db.prepare(`
          UPDATE gatepasses 
          SET is_overdue = 1, status = 'overdue', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(gatepass.id);
        markedCount++;

        // Get student details
        const student = UserModel.findById(gatepass.student_id);
        
        // Calculate overdue duration
        const returnTime = new Date(gatepass.expected_return_time);
        const currentTime = new Date();
        const overdueMinutes = Math.floor((currentTime - returnTime) / (1000 * 60));
        const overdueHours = Math.floor(overdueMinutes / 60);
        const overdueDays = Math.floor(overdueHours / 24);
        
        let overdueDuration = '';
        if (overdueDays > 0) {
          overdueDuration = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
        } else if (overdueHours > 0) {
          overdueDuration = `${overdueHours} hour${overdueHours > 1 ? 's' : ''} overdue`;
        } else {
          overdueDuration = `${overdueMinutes} minute${overdueMinutes > 1 ? 's' : ''} overdue`;
        }

        const notificationMessage = `Student ${student.full_name} (ID: ${student.student_id}) has not returned to the hostel after the scheduled return time (${new Date(gatepass.expected_return_time).toLocaleDateString()}). ${overdueDuration}.`;

        // Notify Security
        const securityUsers = UserModel.findByRole('security');
        for (const securityUser of securityUsers) {
          NotificationModel.create({
            user_id: securityUser.id,
            gatepass_id: gatepass.id,
            title: 'Overdue Student Alert',
            message: notificationMessage,
            type: 'warning'
          });
          notifiedCount++;
        }

        // Notify Coordinator
        if (gatepass.coordinator_id) {
          NotificationModel.create({
            user_id: gatepass.coordinator_id,
            gatepass_id: gatepass.id,
            title: 'Overdue Student Alert',
            message: notificationMessage,
            type: 'warning'
          });
          notifiedCount++;
        }

        // Notify Warden
        if (gatepass.warden_id) {
          NotificationModel.create({
            user_id: gatepass.warden_id,
            gatepass_id: gatepass.id,
            title: 'Overdue Student Alert',
            message: notificationMessage,
            type: 'warning'
          });
          notifiedCount++;
        }

        // Notify all admins
        const adminUsers = UserModel.findByRole('admin');
        for (const adminUser of adminUsers) {
          NotificationModel.create({
            user_id: adminUser.id,
            gatepass_id: gatepass.id,
            title: 'Overdue Student Alert',
            message: notificationMessage,
            type: 'warning'
          });
          notifiedCount++;
        }
      }

      console.log(`✓ Overdue check completed: ${markedCount} marked, ${notifiedCount} notifications sent`);
      return { marked: markedCount, notified: notifiedCount };
    } catch (error) {
      console.error('Error checking overdue gatepasses:', error);
      throw error;
    }
  }

  /**
   * Get all overdue gatepasses with calculated duration
   */
  static getOverdueGatepasses() {
    try {
      const overdueGatepasses = db.prepare(`
        SELECT g.*, 
               u.full_name as student_name, 
               u.student_id as student_roll,
               u.hostel_block,
               u.room_number,
               u.phone as student_phone
        FROM gatepasses g
        JOIN users u ON g.student_id = u.id
        WHERE g.is_overdue = 1 OR (g.status = 'overdue')
        ORDER BY g.expected_return_time ASC
      `).all();

      // Calculate overdue duration for each
      return overdueGatepasses.map(gatepass => {
        const returnTime = new Date(gatepass.expected_return_time);
        const currentTime = new Date();
        const overdueMinutes = Math.floor((currentTime - returnTime) / (1000 * 60));
        const overdueHours = Math.floor(overdueMinutes / 60);
        const overdueDays = Math.floor(overdueHours / 24);
        
        let overdueDuration = '';
        if (overdueDays > 0) {
          overdueDuration = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
        } else if (overdueHours > 0) {
          overdueDuration = `${overdueHours} hour${overdueHours > 1 ? 's' : ''} overdue`;
        } else {
          overdueDuration = `${overdueMinutes} minute${overdueMinutes > 1 ? 's' : ''} overdue`;
        }

        return {
          ...gatepass,
          overdue_duration: overdueDuration,
          overdue_minutes: overdueMinutes
        };
      });
    } catch (error) {
      console.error('Error fetching overdue gatepasses:', error);
      throw error;
    }
  }

  /**
   * Get overdue gatepasses for a specific user role
   */
  static getOverdueForRole(userId, userRole) {
    try {
      let query = `
        SELECT g.*, 
               u.full_name as student_name, 
               u.student_id as student_roll,
               u.hostel_block,
               u.room_number,
               u.phone as student_phone
        FROM gatepasses g
        JOIN users u ON g.student_id = u.id
        WHERE g.is_overdue = 1 OR (g.status = 'overdue')
      `;

      const params = [];

      // Filter based on role
      if (userRole === 'coordinator') {
        query += ' AND g.coordinator_id = ?';
        params.push(userId);
      } else if (userRole === 'warden') {
        query += ' AND g.warden_id = ?';
        params.push(userId);
      }
      // Security and Admin see all overdue

      query += ' ORDER BY g.expected_return_time ASC';

      const overdueGatepasses = db.prepare(query).all(...params);

      // Calculate overdue duration for each
      return overdueGatepasses.map(gatepass => {
        const returnTime = new Date(gatepass.expected_return_time);
        const currentTime = new Date();
        const overdueMinutes = Math.floor((currentTime - returnTime) / (1000 * 60));
        const overdueHours = Math.floor(overdueMinutes / 60);
        const overdueDays = Math.floor(overdueHours / 24);
        
        let overdueDuration = '';
        if (overdueDays > 0) {
          overdueDuration = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
        } else if (overdueHours > 0) {
          overdueDuration = `${overdueHours} hour${overdueHours > 1 ? 's' : ''} overdue`;
        } else {
          overdueDuration = `${overdueMinutes} minute${overdueMinutes > 1 ? 's' : ''} overdue`;
        }

        return {
          ...gatepass,
          overdue_duration: overdueDuration,
          overdue_minutes: overdueMinutes
        };
      });
    } catch (error) {
      console.error('Error fetching overdue gatepasses for role:', error);
      throw error;
    }
  }

  /**
   * Mark a gatepass as resolved (student returned)
   */
  static markAsResolved(gatepassId) {
    try {
      db.prepare(`
        UPDATE gatepasses 
        SET is_overdue = 0, status = 'completed', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(gatepassId);

      return { success: true, message: 'Overdue status resolved' };
    } catch (error) {
      console.error('Error resolving overdue:', error);
      throw error;
    }
  }
}

module.exports = OverdueService;
