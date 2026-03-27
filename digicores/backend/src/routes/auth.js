import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e password obrigatórios' });

  const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  if (password.length < 6) return res.status(400).json({ error: 'Password deve ter pelo menos 6 caracteres' });

  const existing = getDb().prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email já registado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = getDb().prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')`).run(name, email, hash);
  const newId = Number(result.lastInsertRowid);
  const token = jwt.sign({ id: newId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: newId, name, email, role: 'user' } });
});

router.get('/me', verifyToken, (req, res) => {
  res.json(req.user);
});

export default router;
