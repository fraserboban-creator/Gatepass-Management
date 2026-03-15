const UserModel = require('../models/userModel');
const AnalyticsService = require('../services/analyticsService');
const AuthService = require('../services/authService');
const { getPaginationMeta, sanitizeUser } = require('../utils/helpers');

class AdminController {
  /**
   * Get all users
   */
  static getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const role = req.query.role || null;
      const offset = (page - 1) * limit;
      
      const users = UserModel.findAll(limit, offset, role);
      const total = UserModel.count(role);
      
      res.json({
        success: true,
        data: {
          users: users.map(sanitizeUser),
          pagination: getPaginationMeta(page, limit, total)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   */
  static async createUser(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  static updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Remove sensitive fields
      delete updates.password;
      delete updates.password_hash;
      
      UserModel.update(userId, updates);
      const user = UserModel.findById(userId);
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: sanitizeUser(user) }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate user
   */
  static deactivateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      UserModel.deactivate(userId);
      
      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate user
   */
  static activateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      UserModel.activate(userId);
      
      res.json({
        success: true,
        message: 'User activated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analytics
   */
  static getAnalytics(req, res, next) {
    try {
      const startDate = req.query.start_date || null;
      const endDate = req.query.end_date || null;
      
      const stats = AnalyticsService.getDashboardStats(startDate, endDate);
      const approvalRate = AnalyticsService.getApprovalRate(30);
      const topDestinations = AnalyticsService.getTopDestinations(10);
      
      // Get user counts by role
      const totalUsers = UserModel.count();
      const studentCount = UserModel.count('student');
      const coordinatorCount = UserModel.count('coordinator');
      const wardenCount = UserModel.count('warden');
      const securityCount = UserModel.count('security');
      const adminCount = UserModel.count('admin');
      
      res.json({
        success: true,
        data: {
          // Total counts
          totalUsers,
          totalGatepasses: stats.total_gatepasses,
          pendingApprovals: stats.pending,
          activeGatepasses: stats.active_outside,
          
          // Status breakdown
          approvedGatepasses: stats.approved,
          rejectedGatepasses: stats.rejected,
          completedGatepasses: stats.completed,
          coordinatorApprovedGatepasses: stats.coordinator_approved,
          
          // User counts by role
          studentCount,
          coordinatorCount,
          wardenCount,
          securityCount,
          adminCount,
          
          // Additional data
          overdueReturns: stats.overdue_returns,
          approvalRate: approvalRate,
          topDestinations: topDestinations,
          dailyStats: stats.daily_stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  static deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent deleting yourself
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }
      
      UserModel.delete(userId);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logs
   */
  static getLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const LogModel = require('../models/logModel');
      const logs = LogModel.findAll(limit, offset);
      const total = LogModel.count();
      
      res.json({
        success: true,
        data: {
          logs,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
