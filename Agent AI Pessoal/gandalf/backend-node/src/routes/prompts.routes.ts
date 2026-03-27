import { Router } from 'express';
import { promptService } from '../services/prompt.service.js';

export const promptsRouter = Router();

promptsRouter.get('/prompts', async (req, res) => {
  try {
    const { category, search, favorite } = req.query;
    const prompts = await promptService.list({
      category: category as string | undefined,
      search: search as string | undefined,
      favorite: favorite === 'true',
    });
    res.json(prompts);
  } catch {
    res.status(500).json({ message: 'Failed to load prompts' });
  }
});

promptsRouter.get('/prompts/:id', async (req, res) => {
  try {
    const prompt = await promptService.getById(req.params.id as string);
    if (!prompt) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(prompt);
  } catch {
    res.status(500).json({ message: 'Failed to load prompt' });
  }
});

promptsRouter.post('/prompts', async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) { res.status(400).json({ message: 'Title and content required' }); return; }
    const prompt = await promptService.create({ title, content, category, tags });
    res.status(201).json(prompt);
  } catch {
    res.status(500).json({ message: 'Failed to create prompt' });
  }
});

promptsRouter.put('/prompts/:id', async (req, res) => {
  try {
    const prompt = await promptService.update(req.params.id as string, req.body);
    if (!prompt) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(prompt);
  } catch {
    res.status(500).json({ message: 'Failed to update prompt' });
  }
});

promptsRouter.patch('/prompts/:id/favorite', async (req, res) => {
  try {
    const prompt = await promptService.toggleFavorite(req.params.id as string);
    if (!prompt) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(prompt);
  } catch {
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
});

promptsRouter.delete('/prompts/:id', async (req, res) => {
  try {
    await promptService.delete(req.params.id as string);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete prompt' });
  }
});
