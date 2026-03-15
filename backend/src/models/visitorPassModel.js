const { db } = require('../config/database');

class VisitorPassModel {
  /**
   * Create a new visitor pass
   */
  static create(visitorData) {
    const stmt = db.prepare(`
      INSERT INTO visitor_passes (
        visitor_name, visitor_phone, visitor_id_type, visitor_id_number,
        relationship, purpose, student_id, student_name, room_number,
        expected_exit_time, created_by, status, pass_id, visitor_photo_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      visitorData.visitor_name,
      visitorData.visitor_phone,
      visitorData.visitor_id_type,
      visitorData.visitor_id_number,
      visitorData.relationship || null,
      visitorData.purpose,
      visitorData.student_id,
      visitorData.student_name,
      visitorData.room_number,
      visitorData.expected_exit_time,
      visitorData.created_by,
      visitorData.status || 'pending',
      visitorData.pass_id,
      visitorData.visitor_photo_url || null
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Find visitor pass by ID
   */
  static findById(id) {
    return db.prepare(`
      SELECT * FROM visitor_passes WHERE id = ?
    `).get(id);
  }

  /**
   * Find visitor pass by pass ID
   */
  static findByPassId(passId) {
    return db.prepare(`
      SELECT * FROM visitor_passes WHERE pass_id = ?
    `).get(passId);
  }

  /**
   * Find visitor passes by student ID
   */
  static findByStudentId(studentId, limit = 20, offset = 0) {
    return db.prepare(`
      SELECT * FROM visitor_passes 
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(studentId, limit, offset);
  }

  /**
   * Find active visitor passes
   */
  static findActive() {
    return db.prepare(`
      SELECT * FROM visitor_passes 
      WHERE status = 'active'
      ORDER BY entry_time DESC
    `).all();
  }

  /**
   * Find pending visitor passes (for approval)
   */
  static findPending(limit = 50, offset = 0) {
    return db.prepare(`
      SELECT * FROM visitor_passes 
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  /**
   * Find overdue visitor passes
   */
  static findOverdue() {
    return db.prepare(`
      SELECT * FROM visitor_passes 
      WHERE status = 'active' 
      AND expected_exit_time < datetime('now')
      AND actual_exit_time IS NULL
    `).all();
  }

  /**
   * Find all visitor passes with filters
   */
  static findAll(limit = 50, offset = 0, status = null, dateFrom = null, dateTo = null) {
    let query = 'SELECT * FROM visitor_passes WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (dateFrom) {
      query += ' AND DATE(entry_time) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(entry_time) <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  /**
   * Update visitor pass status
   */
  static updateStatus(id, status) {
    return db.prepare(`
      UPDATE visitor_passes 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, id);
  }

  /**
   * Record entry time
   */
  static recordEntry(id) {
    return db.prepare(`
      UPDATE visitor_passes 
      SET entry_time = CURRENT_TIMESTAMP, status = 'active', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Record exit time
   */
  static recordExit(id) {
    return db.prepare(`
      UPDATE visitor_passes 
      SET actual_exit_time = CURRENT_TIMESTAMP, status = 'exited', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Mark as overdue
   */
  static markOverdue(id) {
    return db.prepare(`
      UPDATE visitor_passes 
      SET is_overdue = 1, status = 'overdue', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Approve visitor pass
   */
  static approve(id) {
    return db.prepare(`
      UPDATE visitor_passes 
      SET status = 'approved', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Reject visitor pass
   */
  static reject(id) {
    return db.prepare(`
      UPDATE visitor_passes 
      SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Get statistics
   */
  static getStats(dateFrom = null, dateTo = null) {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'exited' THEN 1 ELSE 0 END) as exited,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM visitor_passes
      WHERE 1=1
    `;
    const params = [];

    if (dateFrom) {
      query += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }

    return db.prepare(query).get(...params);
  }

  /**
   * Get today's statistics
   */
  static getTodayStats() {
    return db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'exited' THEN 1 ELSE 0 END) as exited,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
      FROM visitor_passes
      WHERE DATE(created_at) = DATE('now')
    `).get();
  }

  /**
   * Count visitor passes
   */
  static count(status = null) {
    let query = 'SELECT COUNT(*) as count FROM visitor_passes WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    return db.prepare(query).get(...params).count;
  }

  /**
   * Delete visitor pass
   */
  static delete(id) {
    return db.prepare('DELETE FROM visitor_passes WHERE id = ?').run(id);
  }

  /**
   * Search visitor passes
   */
  static search({ query, status, dateFrom, dateTo, limit = 20 }) {
    let sql = `
      SELECT * FROM visitor_passes
      WHERE 1=1
    `;
    const params = [];

    if (query) {
      sql += ` AND (
        visitor_name LIKE ? OR 
        visitor_phone LIKE ? OR 
        student_name LIKE ? OR
        room_number LIKE ?
      )`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (dateFrom) {
      sql += ' AND DATE(created_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ' AND DATE(created_at) <= ?';
      params.push(dateTo);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    return db.prepare(sql).all(...params);
  }
}

module.exports = VisitorPassModel;
