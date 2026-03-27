import { Router } from 'express';
import { oauthService } from '../services/platform/oauth.service.js';
import { gmailService } from '../services/platform/gmail.service.js';
import { outlookService } from '../services/platform/outlook.service.js';
import { dropboxService } from '../services/platform/dropbox.service.js';
import crypto from 'node:crypto';

export const integrationsRouter = Router();

integrationsRouter.get('/integrations/status', async (_req, res) => {
  try {
    const connected = await oauthService.listConnected();
    res.json({ connected });
  } catch {
    res.status(500).json({ message: 'Failed to get status' });
  }
});

integrationsRouter.get('/integrations/google/authorize', async (_req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    const url = await gmailService.getAuthUrl(state);
    res.json({ url, state });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});

integrationsRouter.get('/integrations/google/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) { res.status(400).json({ message: 'Code required' }); return; }
    const result = await gmailService.handleCallback(code);
    res.redirect(`/?connected=gmail&email=${encodeURIComponent(result.email)}`);
  } catch (err) {
    res.redirect(`/?error=gmail_failed`);
  }
});

integrationsRouter.get('/integrations/microsoft/authorize', async (_req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    const url = await outlookService.getAuthUrl(state);
    res.json({ url, state });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});

integrationsRouter.get('/integrations/microsoft/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) { res.status(400).json({ message: 'Code required' }); return; }
    const result = await outlookService.handleCallback(code);
    res.redirect(`/?connected=outlook&email=${encodeURIComponent(result.email)}`);
  } catch {
    res.redirect(`/?error=outlook_failed`);
  }
});

integrationsRouter.get('/integrations/dropbox/authorize', async (_req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    const url = await dropboxService.getAuthUrl(state);
    res.json({ url, state });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});

integrationsRouter.get('/integrations/dropbox/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) { res.status(400).json({ message: 'Code required' }); return; }
    const result = await dropboxService.handleCallback(code);
    res.redirect(`/?connected=dropbox&email=${encodeURIComponent(result.email)}`);
  } catch {
    res.redirect(`/?error=dropbox_failed`);
  }
});

integrationsRouter.post('/integrations/:platform/disconnect', async (req, res) => {
  try {
    await oauthService.disconnect(req.params.platform);
    res.json({ message: 'Disconnected' });
  } catch {
    res.status(500).json({ message: 'Failed to disconnect' });
  }
});
