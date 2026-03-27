import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const categories = getDb().prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

export default router;
