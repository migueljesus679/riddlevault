import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sanitizeMiddleware } from './middleware/sanitize.middleware.js';
import { rateLimit } from './middleware/rateLimit.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { promptsRouter } from './routes/prompts.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { documentsRouter } from './routes/documents.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { integrationsRouter } from './routes/integrations.routes.js';
import { customApisRouter } from './routes/customApis.routes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(sanitizeMiddleware);
app.use(rateLimit(100));

app.use('/health', healthRouter);
app.use('/', authRouter);
app.use('/', chatRouter);
app.use('/', promptsRouter);
app.use('/', settingsRouter);
app.use('/', documentsRouter);
app.use('/', tasksRouter);
app.use('/', integrationsRouter);
app.use('/', customApisRouter);

app.use(errorMiddleware);
