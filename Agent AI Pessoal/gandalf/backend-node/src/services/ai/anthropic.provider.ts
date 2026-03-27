import type { AIProvider, AIMessage, AIOptions, ModelInfo } from './ai-provider.interface.js';

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(messages: AIMessage[], options: AIOptions): Promise<string> {
    const { systemPrompt, filtered } = this.separateSystem(messages, options.systemPrompt);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens ?? 2048,
        system: systemPrompt,
        messages: filtered.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Anthropic error: ${(err as any).error?.message || response.statusText}`);
    }

    const data = await response.json() as any;
    return data.content?.[0]?.text || '';
  }

  async *streamMessage(messages: AIMessage[], options: AIOptions): AsyncIterable<string> {
    const { systemPrompt, filtered } = this.separateSystem(messages, options.systemPrompt);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens ?? 2048,
        system: systemPrompt,
        messages: filtered.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Anthropic error: ${(err as any).error?.message || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(trimmed.slice(6));
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield event.delta.text;
          }
        } catch { /* skip */ }
      }
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', maxTokens: 200000 },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', maxTokens: 200000 },
    ];
  }

  private separateSystem(messages: AIMessage[], systemPrompt?: string) {
    const systemMsgs = messages.filter(m => m.role === 'system');
    const filtered = messages.filter(m => m.role !== 'system');
    const allSystem = [systemPrompt, ...systemMsgs.map(m => m.content)].filter(Boolean).join('\n\n');
    return { systemPrompt: allSystem || 'You are Gandalf, a wise AI assistant.', filtered };
  }
}
