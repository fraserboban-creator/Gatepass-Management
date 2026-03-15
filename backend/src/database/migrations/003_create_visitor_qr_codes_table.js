/**
 * Migration: Create visitor_qr_codes table
 * Date: 2026-03-13
 * Description: Adds QR code support for visitor passes
 */

const { db } = require('../../config/database');

function up() {
  console.log('Running migration: Create visitor_qr_codes table...');

  // Create visitor_qr_codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_pass_id INTEGER UNIQUE NOT NULL,
      qr_data TEXT NOT NULL,
      qr_hash VARCHAR(255) NOT NULL,
      is_used BOOLEAN DEFAULT 0,
      used_at DATETIME,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visitor_pass_id) REFERENCES visitor_passes(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_visitor_qr_codes_pass 
    ON visitor_qr_codes(visitor_pass_id);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_visitor_qr_codes_hash 
    ON visitor_qr_codes(qr_hash);
  `);

  console.log('✓ visitor_qr_codes table created successfully');
}

function down() {
  console.log('Rolling back migration: Drop visitor_qr_codes table...');
  
  db.exec('DROP INDEX IF EXISTS idx_visitor_qr_codes_hash;');
  db.exec('DROP INDEX IF EXISTS idx_visitor_qr_codes_pass;');
  db.exec('DROP TABLE IF EXISTS visitor_qr_codes;');
  
  console.log('✓ visitor_qr_codes table dropped successfully');
}

module.exports = { up, down };
