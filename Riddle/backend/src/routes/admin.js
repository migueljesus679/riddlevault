const express = require('express');
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/authenticate');
const adminOnly = require('../middleware/adminOnly');
const { hashAnswer } = require('../utils/answerHash');

const router = express.Router();
router.use(authenticate, adminOnly);

// ─── Players ──────────────────────────────────────────────────────────────────

router.get('/players', async (req, res) => {
  try {
    const pool = getDb();
    const { rows } = await pool.query(`
      SELECT u.id, u.username, u.email, u.role, u.points, u.is_banned, u.created_at,
             COUNT(CASE WHEN p.solved=1 THEN 1 END) as solved_count
      FROM users u
      LEFT JOIN user_progress p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

router.patch('/players/:id', async (req, res) => {
  const { points, role, is_banned } = req.body;
  try {
    const pool = getDb();
    const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Player not found' });

    const updates = [];
    const params = [];
    if (points !== undefined) { params.push(Number(points)); updates.push(`points = $${params.length}`); }
    if (role !== undefined && ['user', 'admin'].includes(role)) { params.push(role); updates.push(`role = $${params.length}`); }
    if (is_banned !== undefined) { params.push(is_banned ? 1 : 0); updates.push(`is_banned = $${params.length}`); }

    if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });
    params.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`, params);

    const { rows: updated } = await pool.query(
      'SELECT id, username, email, role, points, is_banned FROM users WHERE id = $1',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

router.delete('/players/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  try {
    const pool = getDb();
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Player deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

router.delete('/players/:id/progress', async (req, res) => {
  try {
    const pool = getDb();
    const { rows } = await pool.query(
      'SELECT SUM(CASE WHEN solved=1 THEN 1 ELSE 0 END) as solved_count FROM user_progress WHERE user_id = $1',
      [req.params.id]
    );
    await pool.query('DELETE FROM user_progress WHERE user_id = $1', [req.params.id]);
    await pool.query('UPDATE users SET points = 0 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Progress reset', cleared_solves: rows[0]?.solved_count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

// ─── Riddles ──────────────────────────────────────────────────────────────────

router.get('/riddles', async (req, res) => {
  try {
    const pool = getDb();
    const { rows } = await pool.query(
      'SELECT id, title, description, difficulty, answer_plain, hint, image_path, points_reward, order_index, is_active FROM riddles ORDER BY difficulty, order_index'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch riddles' });
  }
});

router.post('/riddles', async (req, res) => {
  const { title, description, difficulty, answer, hint, image_path, points_reward, order_index } = req.body;
  if (!title || !description || !difficulty || !answer)
    return res.status(400).json({ error: 'title, description, difficulty, and answer are required' });

  try {
    const pool = getDb();
    const { rows } = await pool.query(`
      INSERT INTO riddles (title, description, difficulty, answer_hash, answer_plain, hint, image_path, points_reward, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, difficulty, answer_plain, hint, image_path, points_reward, order_index, is_active
    `, [title, description, difficulty, hashAnswer(answer), answer, hint || '', image_path || null, points_reward || 10, order_index || 0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create riddle' });
  }
});

router.put('/riddles/:id', async (req, res) => {
  const { title, description, difficulty, answer, hint, image_path, points_reward, order_index, is_active } = req.body;
  try {
    const pool = getDb();
    const { rows: existing } = await pool.query('SELECT id, answer_hash, answer_plain FROM riddles WHERE id = $1', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ error: 'Riddle not found' });

    const newHash = answer ? hashAnswer(answer) : existing[0].answer_hash;
    const newPlain = answer || existing[0].answer_plain;
    await pool.query(`
      UPDATE riddles SET title=$1, description=$2, difficulty=$3, answer_hash=$4, answer_plain=$5,
        hint=$6, image_path=$7, points_reward=$8, order_index=$9, is_active=$10
      WHERE id=$11
    `, [title, description, difficulty, newHash, newPlain, hint || '', image_path || null, points_reward, order_index, is_active ? 1 : 0, req.params.id]);

    const { rows: updated } = await pool.query(
      'SELECT id, title, description, difficulty, answer_plain, hint, image_path, points_reward, order_index, is_active FROM riddles WHERE id = $1',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update riddle' });
  }
});

router.delete('/riddles/:id', async (req, res) => {
  try {
    const pool = getDb();
    const { rowCount } = await pool.query('DELETE FROM riddles WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Riddle not found' });
    res.json({ message: 'Riddle deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete riddle' });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const pool = getDb();
    const [usersRes, solvesRes, pointsRes, riddleStatsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) as n FROM users WHERE role != 'admin'"),
      pool.query('SELECT COUNT(*) as n FROM user_progress WHERE solved = 1'),
      pool.query('SELECT SUM(points) as n FROM users'),
      pool.query(`
        SELECT r.id, r.title, r.difficulty, r.points_reward,
               COUNT(CASE WHEN p.solved=1 THEN 1 END) as solve_count,
               ROUND(AVG(p.attempts), 1) as avg_attempts
        FROM riddles r
        LEFT JOIN user_progress p ON p.riddle_id = r.id
        GROUP BY r.id
        ORDER BY r.difficulty, r.order_index
      `),
    ]);

    res.json({
      total_users: Number(usersRes.rows[0].n),
      total_solves: Number(solvesRes.rows[0].n),
      total_points: Number(pointsRes.rows[0].n) || 0,
      riddle_stats: riddleStatsRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
