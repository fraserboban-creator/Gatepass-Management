const { db } = require('../config/database');

class QRModel {
  /**
   * Create QR code record
   */
  static create(qrData) {
    const stmt = db.prepare(`
      INSERT INTO qr_codes (gatepass_id, qr_data, qr_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      qrData.gatepass_id,
      qrData.qr_data,
      qrData.qr_hash,
      qrData.expires_at
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Find QR code by gatepass ID
   */
  static findByGatepassId(gatepassId) {
    return db.prepare('SELECT * FROM qr_codes WHERE gatepass_id = ?').get(gatepassId);
  }

  /**
   * Find QR code by hash
   */
  static findByHash(hash) {
    return db.prepare('SELECT * FROM qr_codes WHERE qr_hash = ?').get(hash);
  }

  /**
   * Mark QR code as used
   */
  static markAsUsed(id) {
    return db.prepare(`
      UPDATE qr_codes 
      SET is_used = 1, used_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(id);
  }

  /**
   * Check if QR code is valid
   */
  static isValid(gatepassId) {
    const qr = db.prepare(`
      SELECT * FROM qr_codes 
      WHERE gatepass_id = ? 
      AND expires_at > datetime('now')
    `).get(gatepassId);
    
    return qr !== undefined;
  }
}

module.exports = QRModel;
