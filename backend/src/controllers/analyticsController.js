const StudentAnalyticsService = require('../services/studentAnalyticsService');
const UserModel = require('../models/userModel');
const GatepassModel = require('../models/gatepassModel');

class AnalyticsController {
  /**
   * Get global analytics (for admin, coordinator, warden)
   */
  static getGlobalAnalytics(req, res, next) {
    try {
      const startDate = req.query.start_date || null;
      const endDate = req.query.end_date || null;

      const analytics = StudentAnalyticsService.getGlobalAnalytics(startDate, endDate);

      if (!analytics) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch analytics'
        });
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getGlobalAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }

  /**
   * Get student-specific analytics
   */
  static getStudentAnalytics(req, res, next) {
    try {
      const studentId = parseInt(req.params.studentId);
      const userRole = req.user.role;
      const userId = req.user.id;

      // Students can only view their own analytics
      if (userRole === 'student' && userId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own analytics'
        });
      }

      const analytics = StudentAnalyticsService.getStudentAnalytics(studentId);

      if (!analytics) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch student analytics'
        });
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getStudentAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student analytics',
        error: error.message
      });
    }
  }

  /**
   * Get analytics filtered by student (for coordinators/wardens/admins)
   */
  static getAnalyticsByStudent(req, res, next) {
    try {
      const studentId = parseInt(req.params.studentId);
      const startDate = req.query.start_date || null;
      const endDate = req.query.end_date || null;

      const analytics = StudentAnalyticsService.getAnalyticsByStudent(
        studentId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student profile
   */
  static getStudentProfile(req, res, next) {
    try {
      const studentId = parseInt(req.params.studentId);
      const userRole = req.user.role;
      const userId = req.user.id;

      // Students can only view their own profile
      if (userRole === 'student' && userId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own profile'
        });
      }

      // Security can only view limited profile info
      if (userRole === 'security') {
        const user = UserModel.findById(studentId);
        if (!user || user.role !== 'student') {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }

        // Limited info for security
        return res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              full_name: user.full_name,
              student_id: user.student_id,
              hostel_block: user.hostel_block,
              room_number: user.room_number
            },
            activeGatepass: this.getActiveGatepass(studentId)
          }
        });
      }

      const profile = StudentAnalyticsService.getStudentProfile(studentId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student gatepass history
   */
  static getStudentHistory(req, res, next) {
    try {
      const studentId = parseInt(req.params.studentId);
      const userRole = req.user.role;
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const status = req.query.status || null;

      // Students can only view their own history
      if (userRole === 'student' && userId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own history'
        });
      }

      const history = StudentAnalyticsService.getStudentHistory(
        studentId,
        limit,
        offset,
        status
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active gatepass for a student
   */
  static getActiveGatepass(studentId) {
    const { db } = require('../config/database');
    return db.prepare(`
      SELECT * FROM gatepasses
      WHERE student_id = ? AND status = 'approved' AND actual_return_time IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `).get(studentId);
  }

  /**
   * Get analytics dashboard data (role-aware)
   */
  static getDashboardAnalytics(req, res, next) {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;
      const startDate = req.query.start_date || null;
      const endDate = req.query.end_date || null;

      let analytics;

      if (userRole === 'student') {
        // Students see only their own analytics
        analytics = StudentAnalyticsService.getStudentAnalytics(userId);
      } else if (userRole === 'security') {
        // Security sees limited global analytics
        analytics = {
          activeOutside: GatepassModel.getActiveOutside(),
          overdueReturns: GatepassModel.getOverdue()
        };
      } else {
        // Admin, coordinator, warden see global analytics
        analytics = StudentAnalyticsService.getGlobalAnalytics(startDate, endDate);
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top destinations
   */
  static getTopDestinations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const userRole = req.user.role;
      const userId = req.user.id;

      let destinations;

      if (userRole === 'student') {
        destinations = StudentAnalyticsService.getStudentTopDestinations(userId, limit);
      } else {
        const { db } = require('../config/database');
        destinations = db.prepare(`
          SELECT destination, COUNT(*) as count
          FROM gatepasses
          WHERE status IN ('approved', 'completed')
          GROUP BY destination
          ORDER BY count DESC
          LIMIT ?
        `).all(limit);
      }

      res.json({
        success: true,
        data: destinations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get common reasons
   */
  static getCommonReasons(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const userRole = req.user.role;
      const userId = req.user.id;

      let reasons;

      if (userRole === 'student') {
        reasons = StudentAnalyticsService.getStudentCommonReasons(userId, limit);
      } else {
        const { db } = require('../config/database');
        reasons = db.prepare(`
          SELECT reason, COUNT(*) as count
          FROM gatepasses
          GROUP BY reason
          ORDER BY count DESC
          LIMIT ?
        `).all(limit);
      }

      res.json({
        success: true,
        data: reasons
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
