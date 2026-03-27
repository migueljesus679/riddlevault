import { Router } from 'express';
import { ApiKey } from '../models/apiKey.model.js';
import { encrypt, decrypt, maskKey } from '../services/encryption.service.js';
import { providerRegistry } from '../services/ai/provider.registry.js';

export const settingsRouter = Router();

settingsRouter.get('/settings/api-keys', async (_req, res) => {
  try {
    const keys = await ApiKey.find().lean();
    const masked = keys.map(k => ({
      _id: k._id,
      provider: k.provider,
      maskedKey: maskKey(decrypt({ ciphertext: k.ciphertext, iv: k.iv, authTag: k.authTag, keyVersion: k.keyVersion })),
      keyVersion: k.keyVersion,
    }));
    res.json(masked);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load API keys' });
  }
});

settingsRouter.post('/settings/api-keys', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    if (!provider || !apiKey) { res.status(400).json({ message: 'Provider and apiKey required' }); return; }

    const encrypted = encrypt(apiKey);
    await ApiKey.findOneAndUpdate(
      { provider },
      { ...encrypted, provider },
      { upsert: true, new: true }
    );

    providerRegistry.register(provider, apiKey);
    res.json({ message: 'API key saved', provider });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save API key' });
  }
});

settingsRouter.delete('/settings/api-keys/:provider', async (req, res) => {
  try {
    await ApiKey.findOneAndDelete({ provider: req.params.provider });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete API key' });
  }
});

settingsRouter.get('/settings/providers', async (_req, res) => {
  try {
    const registered = providerRegistry.listRegistered();
    const active = providerRegistry.getActive();
    res.json({ registered, active });
  } catch {
    res.status(500).json({ message: 'Failed to get providers' });
  }
});

settingsRouter.post('/settings/providers/active', async (req, res) => {
  try {
    const { provider } = req.body;
    providerRegistry.setActive(provider);
    res.json({ message: 'Active provider set', provider });
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Failed' });
  }
});
