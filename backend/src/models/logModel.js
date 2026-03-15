const { db } = require('../config/database');

class LogModel {
  /**
   * Create log entry
   */
  static create(logData) {
    const stmt = db.prepare(`
      INSERT INTO logs (gatepass_id, student_id, security_id, log_type, location, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      logData.gatepass_id,
      logData.student_id,
      logData.security_id,
      logData.log_type,
      logData.location || null,
      logData.notes || null
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Get logs for a gatepass
   */
  static findByGatepassId(gatepassId) {
    return db.prepare(`
      SELECT l.*, 
             u.full_name as student_name,
             s.full_name as security_name
      FROM logs l
      JOIN users u ON l.student_id = u.id
      JOIN users s ON l.security_id = s.id
      WHERE l.gatepass_id = ?
      ORDER BY l.timestamp DESC
    `).all(gatepassId);
  }

  /**
   * Get recent logs
   */
  static getRecent(limit = 50) {
    return db.prepare(`
      SELECT l.*, 
             u.full_name as student_name,
             u.student_id as student_roll,
             s.full_name as security_name
      FROM logs l
      JOIN users u ON l.student_id = u.id
      JOIN users s ON l.security_id = s.id
      ORDER BY l.timestamp DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * Get logs by student
   */
  static findByStudentId(studentId, limit = 20, offset = 0) {
    return db.prepare(`
      SELECT l.*, s.full_name as security_name
      FROM logs l
      JOIN users s ON l.security_id = s.id
      WHERE l.student_id = ?
      ORDER BY l.timestamp DESC
      LIMIT ? OFFSET ?
    `).all(studentId, limit, offset);
  }

  /**
   * Get all logs with pagination
   */
  static findAll(limit = 50, offset = 0) {
    return db.prepare(`
      SELECT l.*, 
             u.full_name as student_name,
             u.email as user_email,
             s.full_name as security_name,
             g.destination
      FROM logs l
      JOIN users u ON l.student_id = u.id
      JOIN users s ON l.security_id = s.id
      LEFT JOIN gatepasses g ON l.gatepass_id = g.id
      ORDER BY l.timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }

  /**
   * Count all logs
   */
  static count() {
    return db.prepare('SELECT COUNT(*) as count FROM logs').get().count;
  }

  /**
   * Search logs
   */
  static search({ query, dateFrom, dateTo, limit = 20 }) {
    let sql = `
      SELECT l.*, 
             u.full_name as student_name,
             s.full_name as security_name
      FROM logs l
      JOIN users u ON l.student_id = u.id
      JOIN users s ON l.security_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (query) {
      sql += ` AND (
        l.log_type LIKE ? OR 
        l.location LIKE ? OR 
        l.notes LIKE ? OR
        u.full_name LIKE ? OR
        s.full_name LIKE ?
      )`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (dateFrom) {
      sql += ' AND DATE(l.timestamp) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ' AND DATE(l.timestamp) <= ?';
      params.push(dateTo);
    }

    sql += ' ORDER BY l.timestamp DESC LIMIT ?';
    params.push(limit);

    return db.prepare(sql).all(...params);
  }
}

module.exports = LogModel;
