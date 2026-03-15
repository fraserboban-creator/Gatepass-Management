const { db } = require('../config/database');

class UserModel {
  /**
   * Create a new user
   */
  static create(userData) {
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, role, full_name, phone, student_id, hostel_block, room_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userData.email,
      userData.password_hash,
      userData.role,
      userData.full_name,
      userData.phone || null,
      userData.student_id || null,
      userData.hostel_block || null,
      userData.room_number || null
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Find user by email
   */
  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  /**
   * Find user by ID
   */
  static findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  /**
   * Find users by role
   */
  static findByRole(role, limit = 100, offset = 0) {
    return db.prepare('SELECT * FROM users WHERE role = ? LIMIT ? OFFSET ?')
      .all(role, limit, offset);
  }

  /**
   * Get all users with pagination
   */
  static findAll(limit = 20, offset = 0, role = null) {
    let query = 'SELECT * FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return db.prepare(query).all(...params);
  }

  /**
   * Count users
   */
  static count(role = null) {
    let query = 'SELECT COUNT(*) as count FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    return db.prepare(query).get(...params).count;
  }

  /**
   * Update user
   */
  static update(id, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  }

  /**
   * Deactivate user
   */
  static deactivate(id) {
    return db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
  }

  /**
   * Activate user
   */
  static activate(id) {
    return db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(id);
  }

  /**
   * Delete user
   */
  static delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }

  /**
   * Search users
   */
  static search({ query, role, hostelBlock, roomNumber, limit = 20 }) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (query) {
      sql += ` AND (
        full_name LIKE ? OR 
        email LIKE ? OR 
        student_id LIKE ? OR
        phone LIKE ?
      )`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role && role.length > 0) {
      const placeholders = role.map(() => '?').join(',');
      sql += ` AND role IN (${placeholders})`;
      params.push(...role);
    }

    if (hostelBlock && hostelBlock.length > 0) {
      const placeholders = hostelBlock.map(() => '?').join(',');
      sql += ` AND hostel_block IN (${placeholders})`;
      params.push(...hostelBlock);
    }

    if (roomNumber) {
      sql += ' AND room_number LIKE ?';
      params.push(`%${roomNumber}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    return db.prepare(sql).all(...params);
  }
}

module.exports = UserModel;
