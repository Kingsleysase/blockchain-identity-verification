const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../identitydb.sqlite'));
db.pragma('journal_mode = WAL');

const query = (text, params = []) => {
  const isSelect = text.trim().toUpperCase().startsWith('SELECT');
  if (isSelect) {
    return { rows: db.prepare(text).all(...params) };
  } else {
    const result = db.prepare(text).run(...params);
    return { rows: [{ lastInsertRowid: result.lastInsertRowid }], rowCount: result.changes };
  }
};

module.exports = { query, db };
