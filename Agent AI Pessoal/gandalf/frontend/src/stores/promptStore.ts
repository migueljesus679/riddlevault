import { create } from 'zustand';
import { api } from '../services/api';

export interface Prompt {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PromptState {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;

  loadPrompts: (filters?: { category?: string; search?: string; favorite?: boolean }) => Promise<void>;
  createPrompt: (data: { title: string; content: string; category?: string; tags?: string[] }) => Promise<void>;
  updatePrompt: (id: string, data: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompts: [],
  loading: false,
  error: null,

  loadPrompts: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.favorite) params.set('favorite', 'true');
      const q = params.toString();
      const prompts = await api.get<Prompt[]>(`/prompts${q ? `?${q}` : ''}`);
      set({ prompts, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  createPrompt: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post('/prompts', data);
      const prompts = await api.get<Prompt[]>('/prompts');
      set({ prompts, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  updatePrompt: async (id, data) => {
    try {
      await api.put(`/prompts/${id}`, data);
      const prompts = await api.get<Prompt[]>('/prompts');
      set({ prompts });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  deletePrompt: async (id) => {
    try {
      await api.delete(`/prompts/${id}`);
      set((s) => ({ prompts: s.prompts.filter(p => p._id !== id) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  toggleFavorite: async (id) => {
    try {
      const updated = await api.post<Prompt>(`/prompts/${id}/favorite`, {});
      set((s) => ({ prompts: s.prompts.map(p => p._id === id ? updated : p) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },
}));
