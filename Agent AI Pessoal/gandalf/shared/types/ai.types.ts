export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
}

export type AIProviderType = 'openai' | 'anthropic';
