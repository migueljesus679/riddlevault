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

// Serve steganography images
app.use('/images', express.static(path.join(__dirname, '../assets/images')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/riddles', require('./routes/riddles'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Serve built React frontend in production (Render deployment)
if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(dist));
  app.get(/^(?!\/api|\/images).*/, (_, res) =>
    res.sendFile(path.join(dist, 'index.html'))
  );
}

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Auto-seed on first startup (ensures admin + riddles exist after fresh deploy)
function autoSeedIfEmpty() {
  try {
    const { getDb } = require('./database/db');
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as n FROM users').get();
    if (count && count.n === 0) {
      console.log('[seed] Empty database — running initial seed...');
      const { seed } = require('./database/seed');
      seed();
      console.log('[seed] Done.');
    }
  } catch (err) {
    console.error('[seed] Auto-seed failed:', err.message);
  }
}

autoSeedIfEmpty();

app.listen(PORT, () => {
  console.log(`RiddleVault API running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving frontend from /frontend/dist');
  }
});
