const { db } = require('../config/database');

// Fields that must never be written to the audit log details
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'accessToken', 'refreshToken', 'access_token', 'refresh_token'];

/**
 * Strip sensitive fields from a details object before persisting
 */
function sanitizeDetails(details) {
  if (!details || typeof details !== 'object') return details;

  const sanitized = { ...details };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  return sanitized;
}

class AuditLoggerService {
  /**
   * Insert an audit log entry into ai_audit_logs
   * @param {Object} params
   * @param {number} params.adminId
   * @param {number|null} params.commandHistoryId
   * @param {string} params.eventType - 'access_attempt' | 'command_execution' | 'rate_limit_violation' | 'auth_failure'
   * @param {string} params.status - 'success' | 'failure'
   * @param {string} [params.ipAddress]
   * @param {string} [params.userAgent]
   * @param {Object} [params.details]
   * @returns {{ lastInsertRowid: number }}
   */
  static logEvent({ adminId, commandHistoryId = null, eventType, status, ipAddress = null, userAgent = null, details = null }) {
    const safeDetails = sanitizeDetails(details);
    const detailsJson = safeDetails !== null ? JSON.stringify(safeDetails) : null;

    const stmt = db.prepare(`
      INSERT INTO ai_audit_logs (admin_id, command_history_id, event_type, status, ip_address, user_agent, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(adminId, commandHistoryId, eventType, status, ipAddress, userAgent, detailsJson);
  }

  /**
   * Retrieve audit log rows for a given admin, most recent first
   * @param {number} adminId
   * @param {number} limit
   * @returns {Array}
   */
  static getLogsForAdmin(adminId, limit = 50) {
    const stmt = db.prepare(`
      SELECT * FROM ai_audit_logs
      WHERE admin_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(adminId, limit);
  }
}

module.exports = AuditLoggerService;
