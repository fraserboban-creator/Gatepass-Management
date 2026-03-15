const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../../database/hostel_gatepass.db');

async function migrate() {
  console.log('Adding parent contact fields to users table...');

  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  try {
    // Add parent contact fields to users table
    db.run(`ALTER TABLE users ADD COLUMN parent_name VARCHAR(255);`);
    console.log('✓ Added parent_name column');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ parent_name column already exists');
    } else {
      console.error('Error adding parent_name:', error.message);
    }
  }

  try {
    db.run(`ALTER TABLE users ADD COLUMN parent_email VARCHAR(255);`);
    console.log('✓ Added parent_email column');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ parent_email column already exists');
    } else {
      console.error('Error adding parent_email:', error.message);
    }
  }

  try {
    db.run(`ALTER TABLE users ADD COLUMN parent_phone VARCHAR(20);`);
    console.log('✓ Added parent_phone column');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ parent_phone column already exists');
    } else {
      console.error('Error adding parent_phone:', error.message);
    }
  }

  // Save changes
  const data = db.export();
  fs.writeFileSync(DB_PATH, data);
  db.close();

  console.log('\n✅ Migration completed successfully!');
  console.log('Parent contact fields are now available in the users table.');
}

migrate().then(() => process.exit(0)).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
