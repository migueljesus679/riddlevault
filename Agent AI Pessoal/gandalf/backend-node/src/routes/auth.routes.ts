import { Router } from 'express';
import { authService } from '../services/auth.service.js';

export const authRouter = Router();

authRouter.get('/auth/status', async (_req, res) => {
  try {
    const isSetup = await authService.isSetup();
    res.json({ isSetup });
  } catch {
    res.status(500).json({ message: 'Failed to check status' });
  }
});

authRouter.post('/auth/setup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) { res.status(400).json({ message: 'Username and password required' }); return; }
    const token = await authService.setup(username, password);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Setup failed' });
  }
});

authRouter.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) { res.status(400).json({ message: 'Username and password required' }); return; }
    const token = await authService.login(username, password);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Login failed' });
  }
});
