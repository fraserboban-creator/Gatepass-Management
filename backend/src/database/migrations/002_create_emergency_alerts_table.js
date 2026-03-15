import db from '../config/database.js';

export const createEmergencyAlertsTable = () => {
  return new Promise((resolve, reject) => {
    const query = `
      CREATE TABLE IF NOT EXISTS emergency_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        room_number TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'resolved')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    db.run(query, (err) => {
      if (err) {
        console.error('Error creating emergency_alerts table:', err);
        reject(err);
      } else {
        console.log('Emergency alerts table created successfully');
        resolve();
      }
    });
  });
};

export const createEmergencyAlertsIndexes = () => {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_emergency_alerts_student_id ON emergency_alerts(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status)',
      'CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at)',
    ];

    let completed = 0;

    indexes.forEach((indexQuery) => {
      db.run(indexQuery, (err) => {
        if (err) {
          console.error('Error creating index:', err);
          reject(err);
        } else {
          completed++;
          if (completed === indexes.length) {
            console.log('All emergency alerts indexes created successfully');
            resolve();
          }
        }
      });
    });
  });
};
