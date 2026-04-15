require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./src/app');
const { initDatabase, db, saveDatabase } = require('./src/config/database');
const BackgroundJobs = require('./src/services/backgroundJobs');

const PORT = process.env.PORT || 5000;

/**
 * Ensure all required tables exist (idempotent — safe to run on every startup).
 */
function ensureTables() {
  // Add parent_notification_enabled column if it doesn't exist yet
  try {
    db.exec(`ALTER TABLE users ADD COLUMN parent_notification_enabled BOOLEAN DEFAULT 1`);
    saveDatabase();
    console.log('✓ Added parent_notification_enabled column to users');
  } catch (e) {
    // Column already exists — ignore
  }

  const tables = [
    {
      name: 'ai_command_history',
      sql: `CREATE TABLE IF NOT EXISTS ai_command_history (
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
      )`,
    },
    {
      name: 'ai_audit_logs',
      sql: `CREATE TABLE IF NOT EXISTS ai_audit_logs (
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
      )`,
    },
  ];

  for (const table of tables) {
    try {
      db.prepare(`SELECT 1 FROM ${table.name} LIMIT 1`).get();
    } catch (e) {
      if (e.message && e.message.includes('no such table')) {
        console.log(`Creating missing table: ${table.name}`);
        db.exec(table.sql);
        saveDatabase();
        console.log(`✓ ${table.name} created`);
      }
    }
  }
}

// Auto-seed default users if the users table is empty
async function autoSeed() {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (row && row.count === 0) {
      console.log('No users found — running auto-seed...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Password@123', 10);
      const insertUser = db.prepare(`
        INSERT INTO users (email, password_hash, role, full_name, phone, student_id, hostel_block, room_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const users = [
        ['admin@hostel.com', hashedPassword, 'admin', 'Admin User', '+1234567890', null, null, null],
        ['warden@hostel.com', hashedPassword, 'warden', 'Dr. Sarah Johnson', '+1234567891', null, null, null],
        ['coordinator@hostel.com', hashedPassword, 'coordinator', 'Prof. Michael Chen', '+1234567892', null, null, null],
        ['security@hostel.com', hashedPassword, 'security', 'Guard Rajesh Kumar', '+1234567893', null, null, null],
        ['student@hostel.com', hashedPassword, 'student', 'John Doe', '+1234567894', 'STU2024001', 'Block A', 'A-101'],
      ];
      for (const user of users) {
        insertUser.run(...user);
      }
      saveDatabase();
      console.log('✓ Auto-seed completed — default users created');
    }
  } catch (e) {
    console.error('Auto-seed error (non-fatal):', e.message);
  }
}

// Initialize database before starting server
initDatabase().then(async () => {
  // Always run schema to ensure all tables exist (safe — uses CREATE TABLE IF NOT EXISTS)
  const schemaPath = path.join(__dirname, 'src/database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('✓ Schema applied');

  // Ensure AI tables exist (handles existing DBs that predate the migration)
  ensureTables();

  // Auto-seed if empty
  await autoSeed();

  // Clear AI response cache so updated prompts take effect immediately
  const { clearCache } = require('./src/services/aiCommandParserService');
  clearCache();
  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   Hostel Gatepass Management System - Backend API    ║
╠═══════════════════════════════════════════════════════╣
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   API Health: http://localhost:${PORT}/api/health     ║
╚═══════════════════════════════════════════════════════╝
    `);
  });

  // Start background jobs
  BackgroundJobs.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    BackgroundJobs.stop();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    BackgroundJobs.stop();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
