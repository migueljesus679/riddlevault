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

export interface AIProvider {
  readonly name: string;
  sendMessage(messages: AIMessage[], options: AIOptions): Promise<string>;
  streamMessage(messages: AIMessage[], options: AIOptions): AsyncIterable<string>;
  listModels(): Promise<ModelInfo[]>;
}
