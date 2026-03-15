import db from '../config/database.js';

export const emergencyAlertModel = {
  // Create emergency alert
  create: async (alertData) => {
    const {
      student_id,
      student_name,
      room_number,
      location,
      status = 'active',
    } = alertData;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO emergency_alerts (
          student_id,
          student_name,
          room_number,
          location,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `;

      db.run(
        query,
        [student_id, student_name, room_number, location, status],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...alertData });
        }
      );
    });
  },

  // Get all active alerts
  getActive: async () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM emergency_alerts
        WHERE status = 'active'
        ORDER BY created_at DESC
      `;

      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  // Get all alerts with pagination
  getAll: async (limit = 50, offset = 0) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM emergency_alerts
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      db.all(query, [limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  // Get alert by ID
  getById: async (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM emergency_alerts WHERE id = ?';

      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Update alert status
  updateStatus: async (id, status) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE emergency_alerts
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `;

      db.run(query, [status, id], function (err) {
        if (err) reject(err);
        else resolve({ id, status });
      });
    });
  },

  // Get alerts by student ID
  getByStudentId: async (studentId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM emergency_alerts
        WHERE student_id = ?
        ORDER BY created_at DESC
      `;

      db.all(query, [studentId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  // Get alerts count
  getCount: async () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM emergency_alerts';

      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  },

  // Get active alerts count
  getActiveCount: async () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count FROM emergency_alerts
        WHERE status = 'active'
      `;

      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  },

  // Delete alert
  delete: async (id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM emergency_alerts WHERE id = ?';

      db.run(query, [id], function (err) {
        if (err) reject(err);
        else resolve({ id });
      });
    });
  },
};
