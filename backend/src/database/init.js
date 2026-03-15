const fs = require('fs');
const path = require('path');
const { initDatabase, db, saveDatabase } = require('../config/database');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function initialize() {
  try {
    await initDatabase();
    
    // Execute schema
    db.exec(schema);
    saveDatabase();
    
    console.log('✓ Database initialized successfully');
    console.log('✓ Tables created');
    console.log('✓ Indexes created');
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initialize();
