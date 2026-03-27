import { Router } from 'express';
import { providerRegistry } from '../services/ai/provider.registry.js';
import { conversationService } from '../services/conversation.service.js';

export const chatRouter = Router();

chatRouter.get('/conversations', async (_req, res) => {
  try {
    const conversations = await conversationService.list();
    res.json(conversations);
  } catch {
    res.status(500).json({ message: 'Failed to load conversations' });
  }
});

chatRouter.get('/conversations/:id', async (req, res) => {
  try {
    const conv = await conversationService.getById(req.params.id as string);
    if (!conv) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(conv);
  } catch {
    res.status(500).json({ message: 'Failed to load conversation' });
  }
});

chatRouter.delete('/conversations/:id', async (req, res) => {
  try {
    await conversationService.delete(req.params.id as string);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

chatRouter.post('/chat', async (req, res) => {
  try {
    const { message, conversationId, provider, model } = req.body;
    if (!message) { res.status(400).json({ message: 'Message is required' }); return; }

    let convId = conversationId;
    if (!convId) {
      const conv = await conversationService.create(message.slice(0, 50));
      convId = conv._id.toString();
    }

    await conversationService.addMessage(convId, 'user', message);

    const ai = providerRegistry.get(provider);
    const conv = await conversationService.getById(convId);
    if (!conv) { res.status(404).json({ message: 'Conversation not found' }); return; }

    const aiMessages = conv.messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';

    try {
      for await (const chunk of ai.streamMessage(aiMessages, {
        model: model || 'gpt-4o-mini',
        systemPrompt: 'You are Gandalf, a wise and helpful AI assistant. You speak with wisdom and occasional references to Middle-earth, but you are always helpful and practical.',
      })) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk, conversationId: convId })}\n\n`);
      }
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
    }

    await conversationService.addMessage(convId, 'assistant', fullResponse);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ message: 'Chat failed' });
    }
  }
});
