import { create } from 'zustand';
import { api } from '../services/api';

interface ApiKeyInfo {
  _id: string;
  provider: string;
  maskedKey: string;
}

interface ProvidersInfo {
  registered: string[];
  active: string | null;
}

interface SettingsState {
  apiKeys: ApiKeyInfo[];
  providers: ProvidersInfo;
  loading: boolean;
  error: string | null;

  loadApiKeys: () => Promise<void>;
  saveApiKey: (provider: string, apiKey: string) => Promise<void>;
  deleteApiKey: (provider: string) => Promise<void>;
  loadProviders: () => Promise<void>;
  setActiveProvider: (provider: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKeys: [],
  providers: { registered: [], active: null },
  loading: false,
  error: null,

  loadApiKeys: async () => {
    set({ loading: true, error: null });
    try {
      const keys = await api.get<ApiKeyInfo[]>('/settings/api-keys');
      set({ apiKeys: keys, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  saveApiKey: async (provider, apiKey) => {
    set({ loading: true, error: null });
    try {
      await api.post('/settings/api-keys', { provider, apiKey });
      const keys = await api.get<ApiKeyInfo[]>('/settings/api-keys');
      const provs = await api.get<ProvidersInfo>('/settings/providers');
      set({ apiKeys: keys, providers: provs, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  deleteApiKey: async (provider) => {
    try {
      await api.delete(`/settings/api-keys/${provider}`);
      const keys = await api.get<ApiKeyInfo[]>('/settings/api-keys');
      set({ apiKeys: keys });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  loadProviders: async () => {
    try {
      const provs = await api.get<ProvidersInfo>('/settings/providers');
      set({ providers: provs });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  setActiveProvider: async (provider) => {
    try {
      await api.post('/settings/providers/active', { provider });
      set((s) => ({ providers: { ...s.providers, active: provider } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },
}));
