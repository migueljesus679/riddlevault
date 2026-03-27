import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { pythonBridge } from '../services/python-bridge.service.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let pythonStatus = 'unknown';

  try {
    const pythonHealth = await pythonBridge.checkHealth();
    pythonStatus = pythonHealth ? 'connected' : 'disconnected';
  } catch {
    pythonStatus = 'disconnected';
  }

  res.json({
    service: 'gandalf-node-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: mongoStatus,
      pythonApi: pythonStatus,
    },
  });
});
