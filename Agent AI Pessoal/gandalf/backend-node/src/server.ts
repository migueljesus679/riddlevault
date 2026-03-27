import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { providerRegistry } from './services/ai/provider.registry.js';
import { ApiKey } from './models/apiKey.model.js';
import { decrypt } from './services/encryption.service.js';

const PORT = process.env.NODE_PORT || 3001;

async function loadApiKeys() {
  try {
    const keys = await ApiKey.find().lean();
    for (const key of keys) {
      try {
        const apiKey = decrypt({ ciphertext: key.ciphertext, iv: key.iv, authTag: key.authTag, keyVersion: key.keyVersion });
        providerRegistry.register(key.provider as 'openai' | 'anthropic', apiKey);
        console.log(`[AI] ${key.provider} provider loaded from DB`);
      } catch {
        console.warn(`[AI] Failed to decrypt ${key.provider} key`);
      }
    }
  } catch {
    console.log('[AI] No stored API keys found');
  }
}

async function start() {
  await connectDatabase();
  await loadApiKeys();

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-key-here') {
    providerRegistry.register('openai', process.env.OPENAI_API_KEY);
    console.log('[AI] OpenAI provider registered from env');
  }

  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-key-here') {
    providerRegistry.register('anthropic', process.env.ANTHROPIC_API_KEY);
    console.log('[AI] Anthropic provider registered from env');
  }

  app.listen(PORT, () => {
    console.log(`[Gandalf Node API] Running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
