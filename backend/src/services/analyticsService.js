const GatepassModel = require('../models/gatepassModel');

class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  static getDashboardStats(startDate = null, endDate = null) {
    const stats = GatepassModel.getStats(startDate, endDate);
    const activeOutside = GatepassModel.getActiveOutside();
    const overdue = GatepassModel.getOverdue();
    const dailyStats = GatepassModel.getDailyStats(30);

    // Convert stats array to object
    const statusCounts = {};
    stats.forEach(stat => {
      statusCounts[stat.status] = stat.count;
    });

    return {
      total_gatepasses: stats.reduce((sum, stat) => sum + stat.count, 0),
      pending: statusCounts.pending || 0,
      coordinator_approved: statusCounts.coordinator_approved || 0,
      approved: statusCounts.approved || 0,
      rejected: statusCounts.rejected || 0,
      completed: statusCounts.completed || 0,
      active_outside: activeOutside.length,
      overdue_returns: overdue.length,
      daily_stats: dailyStats,
      active_students: activeOutside,
      overdue_students: overdue
    };
  }

  /**
   * Get approval rate
   */
  static getApprovalRate(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const stats = GatepassModel.getStats(startDate.toISOString(), new Date().toISOString());
    
    const approved = stats.find(s => s.status === 'approved')?.count || 0;
    const rejected = stats.find(s => s.status === 'rejected')?.count || 0;
    const total = approved + rejected;
    
    return {
      approved,
      rejected,
      total,
      approval_rate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0
    };
  }

  /**
   * Get top destinations
   */
  static getTopDestinations(limit = 10) {
    const { db } = require('../config/database');
    
    return db.prepare(`
      SELECT destination, COUNT(*) as count
      FROM gatepasses
      WHERE status IN ('approved', 'completed')
      GROUP BY destination
      ORDER BY count DESC
      LIMIT ?
    `).all(limit);
  }
}

module.exports = AnalyticsService;
