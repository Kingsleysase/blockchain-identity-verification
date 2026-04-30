const { db } = require('./index');

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'ADMIN',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS identities (
      identity_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(user_id),
      local_identifier TEXT UNIQUE NOT NULL,
      blockchain_identity_hash TEXT UNIQUE NOT NULL,
      blockchain_transaction_id TEXT,
      salt TEXT NOT NULL,
      qr_code_data TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verification_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      identity_id INTEGER REFERENCES identities(identity_id),
      verifier_id INTEGER,
      verification_time TEXT DEFAULT (datetime('now')),
      result TEXT,
      client_ip TEXT
    );
  `);
  console.log('Database tables created successfully');
};

module.exports = { createTables };
