import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const isSetup = await authService.isSetup();
  if (!isSetup) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  const payload = authService.verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  (req as any).user = payload;
  next();
}
