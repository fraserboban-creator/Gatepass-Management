const { initDatabase, db, saveDatabase } = require('./src/config/database');

async function verifyTables() {
  try {
    await initDatabase();
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('\n✓ Database Tables:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Check visitor_passes table specifically
    const visitorPassesExists = tables.some(t => t.name === 'visitor_passes');
    if (visitorPassesExists) {
      console.log('\n✓ visitor_passes table exists!');
      
      // Get column info
      const columns = db.prepare("PRAGMA table_info(visitor_passes)").all();
      console.log('\n✓ visitor_passes columns:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
      
      // Count rows
      const count = db.prepare("SELECT COUNT(*) as count FROM visitor_passes").get();
      console.log(`\n✓ Total visitor passes: ${count.count}`);
    } else {
      console.log('\n✗ visitor_passes table NOT found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyTables();
