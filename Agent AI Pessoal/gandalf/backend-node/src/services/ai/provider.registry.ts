import type { AIProvider } from './ai-provider.interface.js';
import { createProvider, type ProviderType } from './ai-provider.factory.js';

class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  private activeProvider: string | null = null;

  register(type: ProviderType, apiKey: string): void {
    const provider = createProvider(type, apiKey);
    this.providers.set(type, provider);
    if (!this.activeProvider) this.activeProvider = type;
  }

  get(type?: string): AIProvider {
    const key = type || this.activeProvider;
    if (!key) throw new Error('No AI provider configured');
    const provider = this.providers.get(key);
    if (!provider) throw new Error(`Provider "${key}" not registered`);
    return provider;
  }

  setActive(type: string): void {
    if (!this.providers.has(type)) throw new Error(`Provider "${type}" not registered`);
    this.activeProvider = type;
  }

  getActive(): string | null {
    return this.activeProvider;
  }

  listRegistered(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
