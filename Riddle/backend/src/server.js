const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PORT, FRONTEND_URL } = require('./config');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

app.use('/images', express.static(path.join(__dirname, '../assets/images')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/riddles', require('./routes/riddles'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(dist));
  app.get(/^(?!\/api|\/images).*/, (_, res) =>
    res.sendFile(path.join(dist, 'index.html'))
  );
}

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function autoSeedIfEmpty() {
  try {
    const { getDb } = require('./database/db');
    const { initSchema } = require('./database/schema');
    const pool = getDb();

    await initSchema(pool);

    const { rows } = await pool.query('SELECT COUNT(*) as n FROM users');
    if (Number(rows[0].n) === 0) {
      console.log('[seed] Empty database — running initial seed...');
      const { seed } = require('./database/seed');
      await seed();
      console.log('[seed] Done.');
    }
  } catch (err) {
    console.error('[seed] Auto-seed failed:', err.message);
  }
}

autoSeedIfEmpty().then(() => {
  app.listen(PORT, () => {
    console.log(`RiddleVault API running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log('Serving frontend from /frontend/dist');
    }
  });
});
