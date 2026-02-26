const path = require('path');
const CompatDB = require('./sqlite-compat');
const { initSchema } = require('./schema');

const DB_PATH = path.join(__dirname, '../../../data/riddle.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const lockPath = DB_PATH + '.lock';
    if (fs.existsSync(lockPath)) {
      console.warn('[db] Stale lock file removed:', lockPath);
      fs.unlinkSync(lockPath);
    }

    db = new CompatDB(DB_PATH);
    db.exec('PRAGMA busy_timeout=5000');
    db.exec('PRAGMA foreign_keys=ON');
    initSchema(db);
  }
  return db;
}

function closeDb() {
  if (db) {
    try { db.close(); } catch {}
    db = null;
  }
}

module.exports = { getDb, closeDb };
