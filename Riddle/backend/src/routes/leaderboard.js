const express = require('express');
const { getDb } = require('../database/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = getDb();
    const { rows } = await pool.query(`
      SELECT u.id, u.username, u.points,
             COUNT(CASE WHEN p.solved = 1 THEN 1 END) AS solved_count,
             u.created_at
      FROM users u
      LEFT JOIN user_progress p ON p.user_id = u.id
      WHERE u.is_banned = 0 AND u.role != 'admin'
      GROUP BY u.id
      ORDER BY u.points DESC, solved_count DESC
      LIMIT 50
    `);
    res.json(rows.map((r, i) => ({ rank: i + 1, ...r })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
