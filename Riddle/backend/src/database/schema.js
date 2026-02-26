function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      points INTEGER NOT NULL DEFAULT 0,
      is_banned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS riddles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard','ultimate')),
      answer_hash TEXT NOT NULL,
      answer_plain TEXT,
      hint TEXT NOT NULL DEFAULT '',
      image_path TEXT,
      points_reward INTEGER NOT NULL DEFAULT 10,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      UNIQUE(order_index)
    )
  `);

  // Safe migrations
  try { db.exec('ALTER TABLE riddles ADD COLUMN answer_plain TEXT'); } catch {}
  try { db.exec('ALTER TABLE riddles ADD COLUMN title_pt TEXT'); } catch {}
  try { db.exec('ALTER TABLE riddles ADD COLUMN description_pt TEXT'); } catch {}
  try { db.exec('ALTER TABLE riddles ADD COLUMN answer_hash_pt TEXT'); } catch {}
  try { db.exec('ALTER TABLE riddles ADD COLUMN answer_plain_pt TEXT'); } catch {}
  try { db.exec('ALTER TABLE riddles ADD COLUMN hint_pt TEXT'); } catch {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      riddle_id INTEGER NOT NULL REFERENCES riddles(id) ON DELETE CASCADE,
      solved INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      first_solved_at TEXT,
      UNIQUE(user_id, riddle_id)
    )
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_progress_riddle ON user_progress(riddle_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_points ON users(points)');
}

module.exports = { initSchema };
