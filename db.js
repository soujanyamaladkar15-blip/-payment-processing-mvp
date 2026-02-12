const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'payments.db');

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Failed to open database', err);
    process.exit(1);
  }
});

const initSql = `
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','success','failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(initSql, (err) => {
  if (err) console.error('Failed to initialize DB', err);
});

module.exports = db;
