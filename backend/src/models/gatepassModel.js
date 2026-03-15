const { db } = require('../config/database');

class GatepassModel {
  /**
   * Create a new gatepass
   */
  static create(gatepassData) {
    const stmt = db.prepare(`
      INSERT INTO gatepasses (student_id, enrollment_number, destination, reason, leave_time, expected_return_time, contact_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      gatepassData.student_id,
      gatepassData.enrollment_number || null,
      gatepassData.destination,
      gatepassData.reason,
      gatepassData.leave_time,
      gatepassData.expected_return_time,
      gatepassData.contact_number,
      gatepassData.status || 'pending'
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Find gatepass by ID
   */
  static findById(id) {
    return db.prepare(`
      SELECT g.*, 
             u.full_name as student_name, 
             u.student_id as student_roll,
             u.hostel_block,
             u.room_number,
             c.full_name as coordinator_name,
             w.full_name as warden_name
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
      LEFT JOIN users c ON g.coordinator_id = c.id
      LEFT JOIN users w ON g.warden_id = w.id
      WHERE g.id = ?
    `).get(id);
  }

  /**
   * Find gatepasses by student ID
   */
  static findByStudentId(studentId, limit = 20, offset = 0, status = null) {
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
    
    return db.prepare(query).all(...params);
  }

  /**
   * Find pending gatepasses for coordinator
   */
  static findPendingForCoordinator(limit = 50, offset = 0) {
    return db.prepare(`
      SELECT g.*, 
             u.full_name as student_name,
             u.student_id as student_roll,
             u.hostel_block,
             u.room_number,
             u.phone as student_phone
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
      WHERE g.status = 'pending'
      ORDER BY g.created_at ASC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  /**
   * Find coordinator approved gatepasses for warden
   */
  static findPendingForWarden(limit = 50, offset = 0) {
    return db.prepare(`
      SELECT g.*, 
             u.full_name as student_name,
             u.student_id as student_roll,
             u.hostel_block,
             u.room_number,
             c.full_name as coordinator_name
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
      LEFT JOIN users c ON g.coordinator_id = c.id
      WHERE g.status = 'coordinator_approved'
      ORDER BY g.created_at ASC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  /**
   * Find all gatepasses with student details
   */
  static findAllWithDetails(limit = 50, offset = 0, status = null) {
    let query = `
      SELECT g.*, 
             u.full_name as student_name,
             u.student_id as student_roll,
             u.hostel_block,
             u.room_number
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
    `;
    const params = [];
    
    if (status) {
      query += ' WHERE g.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return db.prepare(query).all(...params);
  }

  /**
   * Update gatepass status
   */
  static updateStatus(id, status, approverId = null, approverRole = null) {
    let query = 'UPDATE gatepasses SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];
    
    if (approverRole === 'coordinator') {
      query += ', coordinator_id = ?';
      params.push(approverId);
    } else if (approverRole === 'warden') {
      query += ', warden_id = ?';
      params.push(approverId);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    return db.prepare(query).run(...params);
  }

  /**
   * Update actual return time
   */
  static updateReturnTime(id, returnTime) {
    return db.prepare(`
      UPDATE gatepasses 
      SET actual_return_time = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(returnTime, id);
  }

  /**
   * Get statistics
   */
  static getStats(startDate = null, endDate = null) {
    let query = 'SELECT status, COUNT(*) as count FROM gatepasses';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' GROUP BY status';
    
    return db.prepare(query).all(...params);
  }

  /**
   * Get daily statistics
   */
  static getDailyStats(days = 30) {
    return db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM gatepasses
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();
  }

  /**
   * Get active students outside
   */
  static getActiveOutside() {
    return db.prepare(`
      SELECT g.*, u.full_name as student_name, u.student_id as student_roll
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
      WHERE g.status = 'approved' 
      AND g.actual_return_time IS NULL
      AND g.leave_time <= datetime('now')
    `).all();
  }

  /**
   * Get overdue returns
   */
  static getOverdue() {
    return db.prepare(`
      SELECT g.*, u.full_name as student_name, u.student_id as student_roll
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
      WHERE g.status = 'approved'
      AND g.actual_return_time IS NULL
      AND g.expected_return_time < datetime('now')
    `).all();
  }

  /**
   * Count gatepasses
   */
  static count(studentId = null, status = null) {
    let query = 'SELECT COUNT(*) as count FROM gatepasses WHERE 1=1';
    const params = [];
    
    if (studentId) {
      query += ' AND student_id = ?';
      params.push(studentId);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    return db.prepare(query).get(...params).count;
  }

  /**
   * Mark exit time
   */
  static markExit(id) {
    return db.prepare(`
      UPDATE gatepasses 
      SET actual_exit_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Mark return time
   */
  static markReturn(id) {
    return db.prepare(`
      UPDATE gatepasses 
      SET actual_return_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Delete gatepass
   */
  static delete(id) {
    return db.prepare('DELETE FROM gatepasses WHERE id = ?').run(id);
  }

  /**
   * Search gatepasses
   */
  static search({ query, status, dateFrom, dateTo, limit = 20 }) {
    let sql = `
      SELECT g.*, 
             u.full_name as student_name,
             u.student_id as student_roll
      FROM gatepasses g
      JOIN users u ON g.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (query) {
      sql += ` AND (
        g.destination LIKE ? OR 
        g.reason LIKE ? OR 
        g.enrollment_number LIKE ? OR
        u.full_name LIKE ? OR
        CAST(g.id AS TEXT) LIKE ?
      )`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status && status.length > 0) {
      const placeholders = status.map(() => '?').join(',');
      sql += ` AND g.status IN (${placeholders})`;
      params.push(...status);
    }

    if (dateFrom) {
      sql += ' AND DATE(g.created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ' AND DATE(g.created_at) <= ?';
      params.push(dateTo);
    }

    sql += ' ORDER BY g.created_at DESC LIMIT ?';
    params.push(limit);

    return db.prepare(sql).all(...params);
  }
}

module.exports = GatepassModel;
