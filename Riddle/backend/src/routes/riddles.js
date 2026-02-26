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

function applyLang(riddle, lang) {
  if (lang === 'pt') {
    return {
      ...riddle,
      title: riddle.title_pt || riddle.title,
      description: riddle.description_pt || riddle.description,
      hint: riddle.hint_pt || riddle.hint,
    };
  }
  return riddle;
}

router.get('/', optionalAuth, async (req, res) => {
  const { difficulty, lang } = req.query;
  const validDifficulties = ['easy', 'medium', 'hard', 'ultimate'];
  if (difficulty && !validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }

  try {
    const pool = getDb();
    let query = `
      SELECT id, title, title_pt, description, description_pt, difficulty,
             hint, hint_pt, image_path, points_reward, order_index
      FROM riddles WHERE is_active = 1
    `;
    const params = [];
    if (difficulty) {
      params.push(difficulty);
      query += ` AND difficulty = $${params.length}`;
    }
    query += ' ORDER BY difficulty, order_index';

    const { rows: riddles } = await pool.query(query, params);

    if (req.user) {
      const { rows: progress } = await pool.query(
        'SELECT riddle_id, solved, attempts FROM user_progress WHERE user_id = $1',
        [req.user.id]
      );
      const progressMap = {};
      for (const p of progress) progressMap[p.riddle_id] = p;

      return res.json(riddles.map(r => applyLang({
        ...r,
        solved: progressMap[r.id]?.solved === 1 || false,
        attempts: progressMap[r.id]?.attempts || 0,
      }, lang)));
    }

    res.json(riddles.map(r => applyLang({ ...r, solved: false, attempts: 0 }, lang)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch riddles' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  const { lang } = req.query;
  try {
    const pool = getDb();
    const { rows } = await pool.query(
      `SELECT id, title, title_pt, description, description_pt, difficulty,
              hint, hint_pt, image_path, points_reward, order_index
       FROM riddles WHERE id = $1 AND is_active = 1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Riddle not found' });

    let progress = { solved: false, attempts: 0 };
    if (req.user) {
      const { rows: p } = await pool.query(
        'SELECT solved, attempts FROM user_progress WHERE user_id = $1 AND riddle_id = $2',
        [req.user.id, rows[0].id]
      );
      if (p[0]) progress = { solved: p[0].solved === 1, attempts: p[0].attempts };
    }

    res.json(applyLang({ ...rows[0], ...progress }, lang));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch riddle' });
  }
});

router.post('/:id/answer', authenticate, answerLimiter, async (req, res) => {
  const { answer, lang } = req.body;
  if (!answer || typeof answer !== 'string') return res.status(400).json({ error: 'Answer is required' });

  try {
    const pool = getDb();
    const { rows: riddleRows } = await pool.query(
      'SELECT id, answer_hash, answer_hash_pt, points_reward FROM riddles WHERE id = $1 AND is_active = 1',
      [req.params.id]
    );
    if (!riddleRows[0]) return res.status(404).json({ error: 'Riddle not found' });
    const riddle = riddleRows[0];

    const { rows: userRows } = await pool.query('SELECT id, is_banned FROM users WHERE id = $1', [req.user.id]);
    if (!userRows[0] || userRows[0].is_banned) return res.status(403).json({ error: 'Account is banned' });

    const { rows: progressRows } = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND riddle_id = $2',
      [req.user.id, riddle.id]
    );
    const progress = progressRows[0];

    if (progress?.solved === 1) {
      return res.json({ correct: true, alreadySolved: true, message: 'You already solved this riddle!' });
    }

    const submitted = hashAnswer(answer);
    const correct = submitted === riddle.answer_hash || (riddle.answer_hash_pt && submitted === riddle.answer_hash_pt);

    if (progress) {
      await pool.query(
        `UPDATE user_progress SET attempts = attempts + 1, solved = $1,
         first_solved_at = CASE WHEN $1 = 1 AND first_solved_at IS NULL THEN NOW() ELSE first_solved_at END
         WHERE user_id = $2 AND riddle_id = $3`,
        [correct ? 1 : 0, req.user.id, riddle.id]
      );
    } else {
      await pool.query(
        'INSERT INTO user_progress (user_id, riddle_id, solved, attempts, first_solved_at) VALUES ($1, $2, $3, 1, $4)',
        [req.user.id, riddle.id, correct ? 1 : 0, correct ? new Date().toISOString() : null]
      );
    }

    if (correct) {
      await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [riddle.points_reward, req.user.id]);
      const { rows: updatedUser } = await pool.query('SELECT points FROM users WHERE id = $1', [req.user.id]);
      const msg = lang === 'pt' ? 'Correto! Muito bem, decifrador!' : 'Correct! Well done, solver!';
      return res.json({ correct: true, points_earned: riddle.points_reward, total_points: updatedUser[0].points, message: msg });
    }

    const msg = lang === 'pt' ? 'Resposta incorreta. Continua a pensar...' : 'Incorrect answer. Keep thinking...';
    res.json({ correct: false, message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

module.exports = router;
