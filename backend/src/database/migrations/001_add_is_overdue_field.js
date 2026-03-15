const { db } = require('../config/database');

/**
 * Migration: Add is_overdue field to gatepasses table
 * This field tracks whether a gatepass has exceeded its expected return time
 */
function migrate() {
  try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(gatepasses)").all();
    const hasIsOverdueColumn = tableInfo.some(col => col.name === 'is_overdue');
    
    if (!hasIsOverdueColumn) {
      db.prepare(`
        ALTER TABLE gatepasses 
        ADD COLUMN is_overdue BOOLEAN DEFAULT 0
      `).run();
      
      console.log('✓ Added is_overdue column to gatepasses table');
    } else {
      console.log('✓ is_overdue column already exists');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

function rollback() {
  try {
    db.prepare(`
      ALTER TABLE gatepasses 
      DROP COLUMN is_overdue
    `).run();
    console.log('✓ Rolled back is_overdue column');
  } catch (error) {
    console.error('Rollback failed:', error);
  }
}

module.exports = { migrate, rollback };
