import { Router } from 'express';
import { taskService } from '../services/task.service.js';

export const tasksRouter = Router();

tasksRouter.get('/tasks', async (_req, res) => {
  try {
    const tasks = await taskService.list();
    res.json(tasks);
  } catch {
    res.status(500).json({ message: 'Failed to load tasks' });
  }
});

tasksRouter.get('/tasks/:id', async (req, res) => {
  try {
    const task = await taskService.getById(req.params.id as string);
    if (!task) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to load task' });
  }
});

tasksRouter.post('/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) { res.status(400).json({ message: 'Title is required' }); return; }
    const task = await taskService.create(title, description || '');
    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: 'Failed to create task' });
  }
});

tasksRouter.post('/tasks/:id/generate-plan', async (req, res) => {
  try {
    const task = await taskService.generatePlan(req.params.id as string);
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});

tasksRouter.post('/tasks/:id/approve', async (req, res) => {
  try {
    const { approved, comment } = req.body;
    const task = await taskService.approvePlan(req.params.id as string, approved, comment);
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});

tasksRouter.post('/tasks/:id/execute', async (req, res) => {
  try {
    res.json({ message: 'Execution started', taskId: req.params.id });
    taskService.executeTask(req.params.id as string).catch(() => {});
  } catch {
    if (!res.headersSent) res.status(500).json({ message: 'Failed' });
  }
});

tasksRouter.post('/tasks/:id/review', async (req, res) => {
  try {
    const { approved, comment } = req.body;
    const task = await taskService.finalReview(req.params.id as string, approved, comment);
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});

tasksRouter.delete('/tasks/:id', async (req, res) => {
  try {
    await taskService.delete(req.params.id as string);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete' });
  }
});
