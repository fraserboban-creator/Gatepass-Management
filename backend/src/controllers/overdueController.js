const OverdueService = require('../services/overdueService');

class OverdueController {
  /**
   * Get all overdue gatepasses
   */
  static async getOverdue(req, res, next) {
    try {
      const overdueGatepasses = OverdueService.getOverdueGatepasses();
      
      res.json({
        success: true,
        data: {
          overdueGatepasses,
          count: overdueGatepasses.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overdue gatepasses for current user's role
   */
  static async getOverdueForRole(req, res, next) {
    try {
      const overdueGatepasses = OverdueService.getOverdueForRole(req.user.id, req.user.role);
      
      res.json({
        success: true,
        data: {
          overdueGatepasses,
          count: overdueGatepasses.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger overdue check (admin only)
   */
  static async checkOverdue(req, res, next) {
    try {
      const result = OverdueService.checkAndMarkOverdue();
      
      res.json({
        success: true,
        message: 'Overdue check completed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark overdue as resolved
   */
  static async markResolved(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.id);
      const result = OverdueService.markAsResolved(gatepassId);
      
      res.json({
        success: true,
        message: 'Overdue status resolved',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OverdueController;
