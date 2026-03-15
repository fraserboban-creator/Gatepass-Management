const { db } = require('../config/database');

class ApprovalModel {
  /**
   * Create approval record
   */
  static create(approvalData) {
    const stmt = db.prepare(`
      INSERT INTO approvals (gatepass_id, approver_id, approver_role, action, comments)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      approvalData.gatepass_id,
      approvalData.approver_id,
      approvalData.approver_role,
      approvalData.action,
      approvalData.comments || null
    );
    
    return result.lastInsertRowid;
  }

  /**
   * Get approvals for a gatepass
   */
  static findByGatepassId(gatepassId) {
    return db.prepare(`
      SELECT a.*, u.full_name as approver_name
      FROM approvals a
      JOIN users u ON a.approver_id = u.id
      WHERE a.gatepass_id = ?
      ORDER BY a.created_at ASC
    `).all(gatepassId);
  }

  /**
   * Get approvals by approver
   */
  static findByApproverId(approverId, limit = 20, offset = 0) {
    return db.prepare(`
      SELECT a.*, g.destination, u.full_name as student_name
      FROM approvals a
      JOIN gatepasses g ON a.gatepass_id = g.id
      JOIN users u ON g.student_id = u.id
      WHERE a.approver_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(approverId, limit, offset);
  }
}

module.exports = ApprovalModel;
