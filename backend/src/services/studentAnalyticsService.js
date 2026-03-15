const { db } = require('../config/database');
const GatepassModel = require('../models/gatepassModel');

class StudentAnalyticsService {
  /**
   * Get analytics for a specific student
   */
  static getStudentAnalytics(studentId) {
    const totalGatepasses = GatepassModel.count(studentId);
    const approved = GatepassModel.count(studentId, 'approved');
    const rejected = GatepassModel.count(studentId, 'rejected');
    const pending = GatepassModel.count(studentId, 'pending');
    const completed = GatepassModel.count(studentId, 'completed');
    const coordinatorApproved = GatepassModel.count(studentId, 'coordinator_approved');

    const topDestinations = this.getStudentTopDestinations(studentId, 5);
    const commonReasons = this.getStudentCommonReasons(studentId, 5);
    const dailyStats = this.getStudentDailyStats(studentId, 30);
    const approvalStats = this.getStudentApprovalStats(studentId);

    return {
      totalGatepasses,
      approved,
      rejected,
      pending,
      completed,
      coordinatorApproved,
      topDestinations,
      commonReasons,
      dailyStats,
      approvalStats,
      approvalRate: totalGatepasses > 0 
        ? ((approved / totalGatepasses) * 100).toFixed(2) 
        : 0
    };
  }

  /**
   * Get top destinations for a student
   */
  static getStudentTopDestinations(studentId, limit = 5) {
    return db.prepare(`
      SELECT destination, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ? AND status IN ('approved', 'completed')
      GROUP BY destination
      ORDER BY count DESC
      LIMIT ?
    `).all(studentId, limit);
  }

  /**
   * Get common reasons for a student
   */
  static getStudentCommonReasons(studentId, limit = 5) {
    return db.prepare(`
      SELECT reason, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ?
      GROUP BY reason
      ORDER BY count DESC
      LIMIT ?
    `).all(studentId, limit);
  }

  /**
   * Get daily statistics for a student
   */
  static getStudentDailyStats(studentId, days = 30) {
    return db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ? AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(studentId);
  }

  /**
   * Get approval statistics for a student
   */
  static getStudentApprovalStats(studentId) {
    return db.prepare(`
      SELECT status, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ?
      GROUP BY status
    `).all(studentId);
  }

  /**
   * Get student profile with all details
   */
  static getStudentProfile(studentId) {
    const user = db.prepare(`
      SELECT * FROM users WHERE id = ? AND role = 'student'
    `).get(studentId);

    if (!user) {
      return null;
    }

    const analytics = this.getStudentAnalytics(studentId);
    const recentGatepasses = db.prepare(`
      SELECT * FROM gatepasses
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(studentId);

    return {
      user,
      analytics,
      recentGatepasses
    };
  }

  /**
   * Get student gatepass history with pagination
   */
  static getStudentHistory(studentId, limit = 20, offset = 0, status = null) {
    let query = `
      SELECT * FROM gatepasses
      WHERE student_id = ?
    `;
    const params = [studentId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const gatepasses = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM gatepasses WHERE student_id = ?';
    const countParams = [studentId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const total = db.prepare(countQuery).get(...countParams).count;

    return {
      gatepasses,
      total,
      limit,
      offset
    };
  }

  /**
   * Get global analytics (for admin, coordinator, warden)
   */
  static getGlobalAnalytics(startDate = null, endDate = null) {
    try {
      let whereClause = '';
      const params = [];

      if (startDate && endDate) {
        whereClause = ' WHERE g.created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      // Total counts with proper query construction
      const totalGatepasses = db.prepare(`
        SELECT COUNT(*) as count FROM gatepasses g ${whereClause}
      `).get(...params).count || 0;

      const approved = db.prepare(`
        SELECT COUNT(*) as count FROM gatepasses g ${whereClause} ${whereClause ? 'AND' : 'WHERE'} g.status = 'approved'
      `).get(...params).count || 0;

      const rejected = db.prepare(`
        SELECT COUNT(*) as count FROM gatepasses g ${whereClause} ${whereClause ? 'AND' : 'WHERE'} g.status = 'rejected'
      `).get(...params).count || 0;

      const pending = db.prepare(`
        SELECT COUNT(*) as count FROM gatepasses g ${whereClause} ${whereClause ? 'AND' : 'WHERE'} g.status = 'pending'
      `).get(...params).count || 0;

      const completed = db.prepare(`
        SELECT COUNT(*) as count FROM gatepasses g ${whereClause} ${whereClause ? 'AND' : 'WHERE'} g.status = 'completed'
      `).get(...params).count || 0;

      const coordinatorApproved = db.prepare(`
        SELECT COUNT(*) as count FROM gatepasses g ${whereClause} ${whereClause ? 'AND' : 'WHERE'} g.status = 'coordinator_approved'
      `).get(...params).count || 0;

      // Top destinations
      const topDestinations = db.prepare(`
        SELECT destination, COUNT(*) as count
        FROM gatepasses g
        ${whereClause} ${whereClause ? 'AND' : 'WHERE'} g.status IN ('approved', 'completed')
        GROUP BY g.destination
        ORDER BY count DESC
        LIMIT 10
      `).all(...params) || [];

      // Common reasons
      const commonReasons = db.prepare(`
        SELECT reason, COUNT(*) as count
        FROM gatepasses g
        ${whereClause}
        GROUP BY g.reason
        ORDER BY count DESC
        LIMIT 10
      `).all(...params) || [];

      // Daily activity
      const dailyActivity = db.prepare(`
        SELECT DATE(g.created_at) as date, COUNT(*) as count
        FROM gatepasses g
        ${whereClause}
        GROUP BY DATE(g.created_at)
        ORDER BY date ASC
      `).all(...params) || [];

      // Status distribution
      const statusDistribution = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM gatepasses g
        ${whereClause}
        GROUP BY g.status
      `).all(...params) || [];

      // Approval rate
      const totalApprovalRelevant = approved + rejected;
      const approvalRate = totalApprovalRelevant > 0 
        ? ((approved / totalApprovalRelevant) * 100).toFixed(2)
        : 0;

      return {
        totalGatepasses,
        approved,
        rejected,
        pending,
        completed,
        coordinatorApproved,
        approvalRate,
        topDestinations,
        commonReasons,
        dailyActivity,
        statusDistribution
      };
    } catch (error) {
      console.error('Error in getGlobalAnalytics:', error);
      return {
        totalGatepasses: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        completed: 0,
        coordinatorApproved: 0,
        approvalRate: 0,
        topDestinations: [],
        commonReasons: [],
        dailyActivity: [],
        statusDistribution: []
      };
    }
  }

  /**
   * Get analytics filtered by student (for coordinators/wardens/admins)
   */
  static getAnalyticsByStudent(studentId, startDate = null, endDate = null) {
    let dateFilter = '';
    const params = [studentId];

    if (startDate && endDate) {
      dateFilter = ' AND g.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const totalGatepasses = db.prepare(`
      SELECT COUNT(*) as count FROM gatepasses WHERE student_id = ? ${dateFilter}
    `).get(...params).count;

    const approved = db.prepare(`
      SELECT COUNT(*) as count FROM gatepasses WHERE student_id = ? AND status = 'approved' ${dateFilter}
    `).get(...params).count;

    const rejected = db.prepare(`
      SELECT COUNT(*) as count FROM gatepasses WHERE student_id = ? AND status = 'rejected' ${dateFilter}
    `).get(...params).count;

    const pending = db.prepare(`
      SELECT COUNT(*) as count FROM gatepasses WHERE student_id = ? AND status = 'pending' ${dateFilter}
    `).get(...params).count;

    const topDestinations = db.prepare(`
      SELECT destination, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ? AND status IN ('approved', 'completed') ${dateFilter}
      GROUP BY destination
      ORDER BY count DESC
      LIMIT 5
    `).all(...params);

    const commonReasons = db.prepare(`
      SELECT reason, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ? ${dateFilter}
      GROUP BY reason
      ORDER BY count DESC
      LIMIT 5
    `).all(...params);

    const dailyStats = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM gatepasses
      WHERE student_id = ? ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(...params);

    return {
      totalGatepasses,
      approved,
      rejected,
      pending,
      topDestinations,
      commonReasons,
      dailyStats,
      approvalRate: totalGatepasses > 0 
        ? ((approved / totalGatepasses) * 100).toFixed(2)
        : 0
    };
  }
}

module.exports = StudentAnalyticsService;
