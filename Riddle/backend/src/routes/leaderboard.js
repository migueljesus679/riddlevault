const express = require('express');
const { getDb } = require('../database/db');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      u.id,
      u.username,
      u.points,
      COUNT(CASE WHEN p.solved = 1 THEN 1 END) AS solved_count,
      u.created_at
    FROM users u
    LEFT JOIN user_progress p ON p.user_id = u.id
    WHERE u.is_banned = 0 AND u.role != 'admin'
    GROUP BY u.id
    ORDER BY u.points DESC, solved_count DESC
    LIMIT 50
  `).all();

  const result = rows.map((r, i) => ({ rank: i + 1, ...r }));
  res.json(result);
});

module.exports = router;
