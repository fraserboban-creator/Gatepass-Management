const { db } = require('../config/database');

class VisitorQRModel {
  /**
   * Create a new visitor QR code record
   */
  static create(qrData) {
    const stmt = db.prepare(`
      INSERT INTO visitor_qr_codes (
        visitor_pass_id, qr_data, qr_hash, expires_at
      )
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      qrData.visitor_pass_id,
      qrData.qr_data,
      qrData.qr_hash,
      qrData.expires_at
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Find QR code by visitor pass ID
   */
  static findByPassId(passId) {
    return db.prepare(`
      SELECT * FROM visitor_qr_codes 
      WHERE visitor_pass_id = ?
    `).get(passId);
  }

  /**
   * Find QR code by hash
   */
  static findByHash(hash) {
    return db.prepare(`
      SELECT * FROM visitor_qr_codes 
      WHERE qr_hash = ?
    `).get(hash);
  }

  /**
   * Check if QR code is valid (not expired and not used)
   */
  static isValid(passId) {
    const qr = db.prepare(`
      SELECT * FROM visitor_qr_codes 
      WHERE visitor_pass_id = ? 
      AND expires_at > datetime('now')
      AND is_used = 0
    `).get(passId);
    
    return qr !== undefined;
  }

  /**
   * Mark QR code as used
   */
  static markAsUsed(id) {
    return db.prepare(`
      UPDATE visitor_qr_codes 
      SET is_used = 1, used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Delete QR code by visitor pass ID
   */
  static deleteByPassId(passId) {
    return db.prepare(`
      DELETE FROM visitor_qr_codes 
      WHERE visitor_pass_id = ?
    `).run(passId);
  }

  /**
   * Update QR code data
   */
  static update(passId, qrData) {
    return db.prepare(`
      UPDATE visitor_qr_codes 
      SET qr_data = ?, qr_hash = ?, expires_at = ?, is_used = 0, used_at = NULL
      WHERE visitor_pass_id = ?
    `).run(qrData.qr_data, qrData.qr_hash, qrData.expires_at, passId);
  }
}

module.exports = VisitorQRModel;
