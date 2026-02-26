const express = require('express');
const rateLimit = require('express-rate-limit');
const { getDb } = require('../database/db');
const { authenticate, optionalAuth } = require('../middleware/authenticate');
const { hashAnswer } = require('../utils/answerHash');

const router = express.Router();

const answerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => `${req.user?.id || req.ip}-${req.params.id}`,
  message: { error: 'Too many attempts. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', optionalAuth, (req, res) => {
  const { difficulty } = req.query;
  const db = getDb();

  const validDifficulties = ['easy', 'medium', 'hard', 'ultimate'];
  if (difficulty && !validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }

  let query = `
    SELECT id, title, description, difficulty, hint, image_path, points_reward, order_index
    FROM riddles WHERE is_active = 1
  `;
  const params = [];
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }
  query += ' ORDER BY difficulty, order_index';

  const riddles = db.prepare(query).all(...params);

  if (req.user) {
    const progress = db.prepare(
      'SELECT riddle_id, solved, attempts FROM user_progress WHERE user_id = ?'
    ).all(req.user.id);
    const progressMap = {};
    for (const p of progress) progressMap[p.riddle_id] = p;

    return res.json(riddles.map(r => ({
      ...r,
      solved: progressMap[r.id]?.solved === 1 || false,
      attempts: progressMap[r.id]?.attempts || 0,
    })));
  }

  res.json(riddles.map(r => ({ ...r, solved: false, attempts: 0 })));
});

router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const riddle = db.prepare(
    'SELECT id, title, description, difficulty, hint, image_path, points_reward, order_index FROM riddles WHERE id = ? AND is_active = 1'
  ).get(req.params.id);
  if (!riddle) return res.status(404).json({ error: 'Riddle not found' });

  let progress = { solved: false, attempts: 0 };
  if (req.user) {
    const p = db.prepare('SELECT solved, attempts FROM user_progress WHERE user_id = ? AND riddle_id = ?').get(req.user.id, riddle.id);
    if (p) progress = { solved: p.solved === 1, attempts: p.attempts };
  }

  res.json({ ...riddle, ...progress });
});

router.post('/:id/answer', authenticate, answerLimiter, (req, res) => {
  const { answer } = req.body;
  if (!answer || typeof answer !== 'string') return res.status(400).json({ error: 'Answer is required' });

  const db = getDb();
  const riddle = db.prepare('SELECT id, answer_hash, points_reward FROM riddles WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!riddle) return res.status(404).json({ error: 'Riddle not found' });

  const user = db.prepare('SELECT id, is_banned FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.is_banned) return res.status(403).json({ error: 'Account is banned' });

  let progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ? AND riddle_id = ?').get(req.user.id, riddle.id);

  if (progress?.solved) {
    return res.json({ correct: true, alreadySolved: true, message: 'You already solved this riddle!' });
  }

  const submitted = hashAnswer(answer);
  const correct = submitted === riddle.answer_hash;

  if (progress) {
    db.prepare('UPDATE user_progress SET attempts = attempts + 1, solved = ?, first_solved_at = CASE WHEN ? = 1 AND first_solved_at IS NULL THEN datetime(\'now\') ELSE first_solved_at END WHERE user_id = ? AND riddle_id = ?')
      .run(correct ? 1 : 0, correct ? 1 : 0, req.user.id, riddle.id);
  } else {
    db.prepare('INSERT INTO user_progress (user_id, riddle_id, solved, attempts, first_solved_at) VALUES (?, ?, ?, 1, ?)')
      .run(req.user.id, riddle.id, correct ? 1 : 0, correct ? `${new Date().toISOString()}` : null);
  }

  if (correct) {
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(riddle.points_reward, req.user.id);
    const updatedUser = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.id);
    return res.json({ correct: true, points_earned: riddle.points_reward, total_points: updatedUser.points, message: 'Correct! Well done, solver!' });
  }

  res.json({ correct: false, message: 'Incorrect answer. Keep thinking...' });
});

module.exports = router;
