/**
 * Migration: Create AI assistant tables
 * Description: Adds ai_command_history and ai_audit_logs tables for the AI admin assistant feature
 */

const { db, saveDatabase } = require('../../config/database');

function up() {
  console.log('Running migration: Create AI tables...');

  // Create ai_command_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_command_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      command_text TEXT NOT NULL,
      parsed_data TEXT,
      action VARCHAR(50),
      confidence_score INTEGER,
      execution_status VARCHAR(30) DEFAULT 'pending_confirmation' CHECK(execution_status IN ('success', 'failed', 'pending_confirmation')),
      execution_result TEXT,
      error_message TEXT,
      requires_confirmation BOOLEAN DEFAULT 0,
      confirmation_given BOOLEAN DEFAULT 0,
      confirmed_at DATETIME,
      executed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_command_history_admin ON ai_command_history(admin_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_command_history_created ON ai_command_history(created_at);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_command_history_action ON ai_command_history(action);`);

  console.log('✓ ai_command_history table created');

  // Create ai_audit_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      command_history_id INTEGER,
      event_type VARCHAR(50) NOT NULL CHECK(event_type IN ('access_attempt', 'command_execution', 'rate_limit_violation', 'auth_failure')),
      status VARCHAR(20) NOT NULL CHECK(status IN ('success', 'failure')),
      ip_address VARCHAR(45),
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (command_history_id) REFERENCES ai_command_history(id) ON DELETE SET NULL
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_admin ON ai_audit_logs(admin_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_created ON ai_audit_logs(created_at);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_ai_audit_logs_event ON ai_audit_logs(event_type);`);

  console.log('✓ ai_audit_logs table created');

  saveDatabase();
  console.log('✓ AI tables migration completed successfully');
}

function down() {
  console.log('Rolling back migration: Drop AI tables...');

  db.exec('DROP INDEX IF EXISTS idx_ai_audit_logs_event;');
  db.exec('DROP INDEX IF EXISTS idx_ai_audit_logs_created;');
  db.exec('DROP INDEX IF EXISTS idx_ai_audit_logs_admin;');
  db.exec('DROP TABLE IF EXISTS ai_audit_logs;');

  db.exec('DROP INDEX IF EXISTS idx_ai_command_history_action;');
  db.exec('DROP INDEX IF EXISTS idx_ai_command_history_created;');
  db.exec('DROP INDEX IF EXISTS idx_ai_command_history_admin;');
  db.exec('DROP TABLE IF EXISTS ai_command_history;');

  saveDatabase();
  console.log('✓ AI tables dropped successfully');
}

module.exports = { up, down };
