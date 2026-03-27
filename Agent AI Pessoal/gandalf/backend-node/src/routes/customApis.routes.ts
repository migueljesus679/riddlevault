import { Router } from 'express';
import { customApiService } from '../services/customApi.service.js';

export const customApisRouter = Router();

customApisRouter.get('/custom-apis', async (_req, res) => {
  try {
    const apis = await customApiService.list();
    res.json(apis);
  } catch {
    res.status(500).json({ message: 'Failed to load APIs' });
  }
});

customApisRouter.get('/custom-apis/:id', async (req, res) => {
  try {
    const api = await customApiService.getById(req.params.id as string);
    if (!api) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(api);
  } catch {
    res.status(500).json({ message: 'Failed to load API' });
  }
});

customApisRouter.post('/custom-apis', async (req, res) => {
  try {
    const { name, baseUrl } = req.body;
    if (!name || !baseUrl) { res.status(400).json({ message: 'Name and baseUrl required' }); return; }
    const api = await customApiService.create(req.body);
    res.status(201).json(api);
  } catch {
    res.status(500).json({ message: 'Failed to create API' });
  }
});

customApisRouter.put('/custom-apis/:id', async (req, res) => {
  try {
    const api = await customApiService.update(req.params.id as string, req.body);
    if (!api) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(api);
  } catch {
    res.status(500).json({ message: 'Failed to update API' });
  }
});

customApisRouter.delete('/custom-apis/:id', async (req, res) => {
  try {
    await customApiService.delete(req.params.id as string);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete API' });
  }
});

customApisRouter.post('/custom-apis/:id/test/:endpointIndex', async (req, res) => {
  try {
    const result = await customApiService.testEndpoint(
      req.params.id as string,
      parseInt(req.params.endpointIndex, 10),
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Test failed' });
  }
});
