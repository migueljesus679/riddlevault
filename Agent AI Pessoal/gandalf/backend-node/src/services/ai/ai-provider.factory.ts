import type { AIProvider } from './ai-provider.interface.js';
import { OpenAIProvider } from './openai.provider.js';
import { AnthropicProvider } from './anthropic.provider.js';

export type ProviderType = 'openai' | 'anthropic';

export function createProvider(type: ProviderType, apiKey: string): AIProvider {
  switch (type) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    default:
      throw new Error(`Provider "${type}" not supported`);
  }
}
