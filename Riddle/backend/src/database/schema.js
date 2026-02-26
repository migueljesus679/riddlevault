async function initSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      points INTEGER NOT NULL DEFAULT 0,
      is_banned INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS riddles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      title_pt TEXT,
      description TEXT NOT NULL,
      description_pt TEXT,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard','ultimate')),
      answer_hash TEXT NOT NULL,
      answer_plain TEXT,
      answer_hash_pt TEXT,
      answer_plain_pt TEXT,
      hint TEXT NOT NULL DEFAULT '',
      hint_pt TEXT,
      image_path TEXT,
      audio_path TEXT,
      points_reward INTEGER NOT NULL DEFAULT 10,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      UNIQUE(order_index)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      riddle_id INTEGER NOT NULL REFERENCES riddles(id) ON DELETE CASCADE,
      solved INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      first_solved_at TIMESTAMPTZ,
      UNIQUE(user_id, riddle_id)
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_progress_riddle ON user_progress(riddle_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_users_points ON users(points)');

  // Safe column migrations (idempotent)
  const migrations = [
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS title_pt TEXT',
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS description_pt TEXT',
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS answer_hash_pt TEXT',
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS answer_plain_pt TEXT',
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS hint_pt TEXT',
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS audio_path TEXT',
    'ALTER TABLE riddles ADD COLUMN IF NOT EXISTS answer_plain TEXT',
  ];
  for (const sql of migrations) {
    await pool.query(sql);
  }
}

module.exports = { initSchema };
