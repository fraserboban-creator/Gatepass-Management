const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../../database/hostel_gatepass.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  return db;
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Wrapper to make sql.js API similar to better-sqlite3
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        if (!db) throw new Error('Database not initialized');
        db.run(sql, params);
        saveDatabase();
        
        // Get last insert rowid
        let lastId = null;
        try {
          const result = db.exec('SELECT last_insert_rowid() as id');
          if (result.length > 0 && result[0].values.length > 0) {
            lastId = result[0].values[0][0];
          }
        } catch (e) {
          console.error('Error getting last insert rowid:', e);
        }
        
        return { 
          changes: db.getRowsModified(), 
          lastInsertRowid: lastId 
        };
      },
      get: (...params) => {
        if (!db) throw new Error('Database not initialized');
        const result = db.exec(sql, params);
        if (result.length === 0) return undefined;
        const columns = result[0].columns;
        const values = result[0].values[0];
        if (!values) return undefined;
        const row = {};
        columns.forEach((col, i) => row[col] = values[i]);
        return row;
      },
      all: (...params) => {
        if (!db) throw new Error('Database not initialized');
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        const columns = result[0].columns;
        return result[0].values.map(values => {
          const row = {};
          columns.forEach((col, i) => row[col] = values[i]);
          return row;
        });
      }
    };
  },
  exec: (sql) => {
    if (!db) throw new Error('Database not initialized');
    db.exec(sql);
    saveDatabase();
  },
  pragma: (pragma) => {
    if (!db) throw new Error('Database not initialized');
    db.run(`PRAGMA ${pragma}`);
  }
};

module.exports = { initDatabase, db: dbWrapper, saveDatabase };
