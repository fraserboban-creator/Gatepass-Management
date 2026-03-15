import { emergencyAlertService } from '../services/emergencyAlertService.js';

export const emergencyAlertController = {
  // Create emergency alert
  createAlert: async (req, res) => {
    try {
      const { student_id, student_name, room_number, location } = req.body;

      // Validate required fields
      if (!student_id || !student_name || !room_number) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: student_id, student_name, room_number',
        });
      }

      const alert = await emergencyAlertService.createAlert({
        student_id,
        student_name,
        room_number,
        location: location || 'Unknown',
      });

      res.status(201).json({
        success: true,
        message: 'Emergency alert created successfully',
        data: alert,
      });
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create emergency alert',
        error: error.message,
      });
    }
  },

  // Get active alerts
  getActiveAlerts: async (req, res) => {
    try {
      const alerts = await emergencyAlertService.getActiveAlerts();

      res.status(200).json({
        success: true,
        message: 'Active alerts retrieved successfully',
        data: { alerts, count: alerts.length },
      });
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active alerts',
        error: error.message,
      });
    }
  },

  // Get all alerts with pagination
  getAllAlerts: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const { alerts, total } = await emergencyAlertService.getAllAlerts(limit, offset);

      res.status(200).json({
        success: true,
        message: 'Alerts retrieved successfully',
        data: { alerts, total, limit, offset },
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alerts',
        error: error.message,
      });
    }
  },

  // Get alert by ID
  getAlertById: async (req, res) => {
    try {
      const { id } = req.params;

      const alert = await emergencyAlertService.getAlertById(id);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Alert retrieved successfully',
        data: alert,
      });
    } catch (error) {
      console.error('Error fetching alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alert',
        error: error.message,
      });
    }
  },

  // Resolve alert
  resolveAlert: async (req, res) => {
    try {
      const { id } = req.params;

      const alert = await emergencyAlertService.resolveAlert(id);

      res.status(200).json({
        success: true,
        message: 'Alert resolved successfully',
        data: alert,
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve alert',
        error: error.message,
      });
    }
  },

  // Get student alerts
  getStudentAlerts: async (req, res) => {
    try {
      const { studentId } = req.params;

      const alerts = await emergencyAlertService.getStudentAlerts(studentId);

      res.status(200).json({
        success: true,
        message: 'Student alerts retrieved successfully',
        data: { alerts, count: alerts.length },
      });
    } catch (error) {
      console.error('Error fetching student alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student alerts',
        error: error.message,
      });
    }
  },

  // Get active alerts count
  getActiveAlertsCount: async (req, res) => {
    try {
      const count = await emergencyAlertService.getActiveAlertsCount();

      res.status(200).json({
        success: true,
        message: 'Active alerts count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      console.error('Error fetching active alerts count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active alerts count',
        error: error.message,
      });
    }
  },
};
