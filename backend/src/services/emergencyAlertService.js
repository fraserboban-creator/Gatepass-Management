import { emergencyAlertModel } from '../models/emergencyAlertModel.js';
import { notificationService } from './notificationService.js';

export const emergencyAlertService = {
  // Create and send emergency alert
  createAlert: async (alertData) => {
    try {
      // Create alert in database
      const alert = await emergencyAlertModel.create(alertData);

      // Send notifications to security, warden, and coordinator
      const notificationMessage = `🚨 Emergency alert from ${alertData.student_name} (Room ${alertData.room_number}). Immediate attention required!`;

      // Notify security
      await notificationService.createNotification({
        user_id: null, // Will be sent to all security staff
        type: 'emergency_alert',
        title: 'Emergency Alert',
        message: notificationMessage,
        data: {
          alert_id: alert.id,
          student_id: alertData.student_id,
          student_name: alertData.student_name,
          room_number: alertData.room_number,
          location: alertData.location,
        },
        recipient_role: 'security',
      });

      // Notify warden
      await notificationService.createNotification({
        user_id: null,
        type: 'emergency_alert',
        title: 'Emergency Alert',
        message: notificationMessage,
        data: {
          alert_id: alert.id,
          student_id: alertData.student_id,
          student_name: alertData.student_name,
          room_number: alertData.room_number,
          location: alertData.location,
        },
        recipient_role: 'warden',
      });

      // Notify coordinator
      await notificationService.createNotification({
        user_id: null,
        type: 'emergency_alert',
        title: 'Emergency Alert',
        message: notificationMessage,
        data: {
          alert_id: alert.id,
          student_id: alertData.student_id,
          student_name: alertData.student_name,
          room_number: alertData.room_number,
          location: alertData.location,
        },
        recipient_role: 'coordinator',
      });

      return alert;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  },

  // Get all active alerts
  getActiveAlerts: async () => {
    try {
      return await emergencyAlertModel.getActive();
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }
  },

  // Get all alerts with pagination
  getAllAlerts: async (limit = 50, offset = 0) => {
    try {
      const alerts = await emergencyAlertModel.getAll(limit, offset);
      const count = await emergencyAlertModel.getCount();
      return { alerts, total: count };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Get alert by ID
  getAlertById: async (id) => {
    try {
      return await emergencyAlertModel.getById(id);
    } catch (error) {
      console.error('Error fetching alert:', error);
      throw error;
    }
  },

  // Resolve alert
  resolveAlert: async (id) => {
    try {
      const alert = await emergencyAlertModel.updateStatus(id, 'resolved');

      // Send notification that alert is resolved
      await notificationService.createNotification({
        user_id: null,
        type: 'alert_resolved',
        title: 'Alert Resolved',
        message: `Emergency alert for ${alert.student_name} has been marked as resolved.`,
        data: { alert_id: id },
        recipient_role: 'security',
      });

      return alert;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  },

  // Get alerts by student
  getStudentAlerts: async (studentId) => {
    try {
      return await emergencyAlertModel.getByStudentId(studentId);
    } catch (error) {
      console.error('Error fetching student alerts:', error);
      throw error;
    }
  },

  // Get active alerts count
  getActiveAlertsCount: async () => {
    try {
      return await emergencyAlertModel.getActiveCount();
    } catch (error) {
      console.error('Error fetching active alerts count:', error);
      throw error;
    }
  },
};
