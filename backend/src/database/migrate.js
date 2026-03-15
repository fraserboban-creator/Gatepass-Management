const { initDatabase, db, saveDatabase } = require('../config/database');

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    await initDatabase();
    
    // Check if actual_exit_time column exists
    try {
      db.prepare('SELECT actual_exit_time FROM gatepasses LIMIT 1').get();
      console.log('✓ actual_exit_time column already exists');
    } catch (error) {
      if (error.message.includes('no such column')) {
        console.log('Adding actual_exit_time column...');
        db.exec('ALTER TABLE gatepasses ADD COLUMN actual_exit_time DATETIME');
        saveDatabase();
        console.log('✓ actual_exit_time column added');
      } else {
        throw error;
      }
    }
    
    // Check if actual_return_time column exists
    try {
      db.prepare('SELECT actual_return_time FROM gatepasses LIMIT 1').get();
      console.log('✓ actual_return_time column already exists');
    } catch (error) {
      if (error.message.includes('no such column')) {
        console.log('Adding actual_return_time column...');
        db.exec('ALTER TABLE gatepasses ADD COLUMN actual_return_time DATETIME');
        saveDatabase();
        console.log('✓ actual_return_time column added');
      } else {
        throw error;
      }
    }
    
    // Check if enrollment_number column exists
    try {
      db.prepare('SELECT enrollment_number FROM gatepasses LIMIT 1').get();
      console.log('✓ enrollment_number column already exists');
    } catch (error) {
      if (error.message.includes('no such column')) {
        console.log('Adding enrollment_number column...');
        db.exec('ALTER TABLE gatepasses ADD COLUMN enrollment_number VARCHAR(50)');
        saveDatabase();
        console.log('✓ enrollment_number column added');
      } else {
        throw error;
      }
    }
    
    // Check if is_overdue column exists
    try {
      db.prepare('SELECT is_overdue FROM gatepasses LIMIT 1').get();
      console.log('✓ is_overdue column already exists');
    } catch (error) {
      if (error.message.includes('no such column')) {
        console.log('Adding is_overdue column...');
        db.exec('ALTER TABLE gatepasses ADD COLUMN is_overdue BOOLEAN DEFAULT 0');
        saveDatabase();
        console.log('✓ is_overdue column added');
      } else {
        throw error;
      }
    }
    
    // Check if visitor_qr_codes table exists
    try {
      db.prepare('SELECT * FROM visitor_qr_codes LIMIT 1').get();
      console.log('✓ visitor_qr_codes table already exists');
    } catch (error) {
      if (error.message.includes('no such table')) {
        console.log('Creating visitor_qr_codes table...');
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
        
        db.exec(`
          CREATE INDEX IF NOT EXISTS idx_visitor_qr_codes_pass 
          ON visitor_qr_codes(visitor_pass_id);
        `);
        
        db.exec(`
          CREATE INDEX IF NOT EXISTS idx_visitor_qr_codes_hash 
          ON visitor_qr_codes(qr_hash);
        `);
        
        saveDatabase();
        console.log('✓ visitor_qr_codes table created');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
