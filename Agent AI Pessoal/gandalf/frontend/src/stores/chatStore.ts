import { create } from 'zustand';
import { api } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;

  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  newConversation: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  error: null,

  setActiveConversation: (id) => {
    const conv = get().conversations.find((c) => c._id === id);
    set({ activeConversationId: id, messages: conv?.messages || [] });
  },

  newConversation: () => {
    set({ activeConversationId: null, messages: [], error: null });
  },

  loadConversations: async () => {
    try {
      const data = await api.get<Conversation[]>('/conversations');
      set({ conversations: data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load conversations' });
    }
  },

  sendMessage: async (content) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg, assistantMsg],
      isStreaming: true,
      error: null,
    }));

    try {
      await api.stream('/chat', {
        message: content,
        conversationId: get().activeConversationId,
      }, (chunk) => {
        set((s) => {
          const msgs = [...s.messages];
          const last = msgs[msgs.length - 1];
          if (last.role === 'assistant') {
            msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
          }
          return { messages: msgs };
        });
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to send message' });
    } finally {
      set({ isStreaming: false });
    }
  },
}));
