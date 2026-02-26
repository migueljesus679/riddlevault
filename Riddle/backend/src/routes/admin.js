const express = require('express');
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/authenticate');
const adminOnly = require('../middleware/adminOnly');
const { hashAnswer } = require('../utils/answerHash');

const router = express.Router();
router.use(authenticate, adminOnly);

// ─── Players ──────────────────────────────────────────────────────────────────

router.get('/players', (req, res) => {
  const db = getDb();
  const players = db.prepare(`
    SELECT u.id, u.username, u.email, u.role, u.points, u.is_banned, u.created_at,
           COUNT(CASE WHEN p.solved=1 THEN 1 END) as solved_count
    FROM users u
    LEFT JOIN user_progress p ON p.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();
  res.json(players);
});

router.patch('/players/:id', (req, res) => {
  const { points, role, is_banned } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Player not found' });

  const updates = [];
  const params = [];
  if (points !== undefined) { updates.push('points = ?'); params.push(Number(points)); }
  if (role !== undefined && ['user', 'admin'].includes(role)) { updates.push('role = ?'); params.push(role); }
  if (is_banned !== undefined) { updates.push('is_banned = ?'); params.push(is_banned ? 1 : 0); }

  if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });
  params.push(req.params.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT id, username, email, role, points, is_banned FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/players/:id', (req, res) => {
  const db = getDb();
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Player not found' });
  res.json({ message: 'Player deleted' });
});

router.delete('/players/:id/progress', (req, res) => {
  const db = getDb();
  const progress = db.prepare('SELECT SUM(CASE WHEN solved=1 THEN 1 ELSE 0 END) as solved_count FROM user_progress WHERE user_id = ?').get(req.params.id);
  db.prepare('DELETE FROM user_progress WHERE user_id = ?').run(req.params.id);
  db.prepare('UPDATE users SET points = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Progress reset', cleared_solves: progress?.solved_count || 0 });
});

// ─── Riddles ──────────────────────────────────────────────────────────────────

router.get('/riddles', (req, res) => {
  const db = getDb();
  const riddles = db.prepare('SELECT id, title, description, difficulty, answer_plain, hint, image_path, points_reward, order_index, is_active FROM riddles ORDER BY difficulty, order_index').all();
  res.json(riddles);
});

router.post('/riddles', (req, res) => {
  const { title, description, difficulty, answer, hint, image_path, points_reward, order_index } = req.body;
  if (!title || !description || !difficulty || !answer)
    return res.status(400).json({ error: 'title, description, difficulty, and answer are required' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO riddles (title, description, difficulty, answer_hash, answer_plain, hint, image_path, points_reward, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, difficulty, hashAnswer(answer), answer, hint || '', image_path || null, points_reward || 10, order_index || 0);

  const riddle = db.prepare('SELECT id, title, description, difficulty, answer_plain, hint, image_path, points_reward, order_index, is_active FROM riddles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(riddle);
});

router.put('/riddles/:id', (req, res) => {
  const { title, description, difficulty, answer, hint, image_path, points_reward, order_index, is_active } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id, answer_hash, answer_plain FROM riddles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Riddle not found' });

  const newHash = answer ? hashAnswer(answer) : existing.answer_hash;
  const newPlain = answer || existing.answer_plain;
  db.prepare(`
    UPDATE riddles SET title=?, description=?, difficulty=?, answer_hash=?, answer_plain=?, hint=?, image_path=?, points_reward=?, order_index=?, is_active=?
    WHERE id=?
  `).run(title, description, difficulty, newHash, newPlain, hint || '', image_path || null, points_reward, order_index, is_active ? 1 : 0, req.params.id);

  const updated = db.prepare('SELECT id, title, description, difficulty, answer_plain, hint, image_path, points_reward, order_index, is_active FROM riddles WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/riddles/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM riddles WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Riddle not found' });
  res.json({ message: 'Riddle deleted' });
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
  const db = getDb();
  const total_users = db.prepare("SELECT COUNT(*) as n FROM users WHERE role != 'admin'").get().n;
  const total_solves = db.prepare('SELECT COUNT(*) as n FROM user_progress WHERE solved = 1').get().n;
  const total_points = db.prepare('SELECT SUM(points) as n FROM users').get().n || 0;

  const riddle_stats = db.prepare(`
    SELECT r.id, r.title, r.difficulty, r.points_reward,
           COUNT(CASE WHEN p.solved=1 THEN 1 END) as solve_count,
           ROUND(AVG(p.attempts), 1) as avg_attempts
    FROM riddles r
    LEFT JOIN user_progress p ON p.riddle_id = r.id
    GROUP BY r.id
    ORDER BY r.difficulty, r.order_index
  `).all();

  res.json({ total_users, total_solves, total_points, riddle_stats });
});

module.exports = router;
