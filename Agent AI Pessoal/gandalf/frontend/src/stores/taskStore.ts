import { create } from 'zustand';
import { api } from '../services/api';

export type TaskStatus = 'DRAFT_PLAN' | 'WAITING_APPROVAL' | 'RUNNING' | 'WAITING_FINAL_REVIEW' | 'DONE' | 'FAILED' | 'CANCELLED';

export interface TaskStep {
  stepId: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskItem {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  plan: { steps: TaskStep[] };
  approval?: { approved: boolean; approvedAt: string; comment: string };
  executionLog: string[];
  result?: string;
  createdAt: string;
  completedAt?: string;
}

interface TaskState {
  tasks: TaskItem[];
  activeTask: TaskItem | null;
  loading: boolean;
  error: string | null;

  loadTasks: () => Promise<void>;
  loadTask: (id: string) => Promise<void>;
  createTask: (title: string, description: string) => Promise<void>;
  generatePlan: (id: string) => Promise<void>;
  approvePlan: (id: string, approved: boolean, comment?: string) => Promise<void>;
  executeTask: (id: string) => Promise<void>;
  finalReview: (id: string, approved: boolean, comment?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  pollTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTask: null,
  loading: false,
  error: null,

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.get<TaskItem[]>('/tasks');
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  loadTask: async (id) => {
    try {
      const task = await api.get<TaskItem>(`/tasks/${id}`);
      set({ activeTask: task });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  createTask: async (title, description) => {
    set({ loading: true, error: null });
    try {
      const task = await api.post<TaskItem>('/tasks', { title, description });
      set((s) => ({ tasks: [task, ...s.tasks], activeTask: task, loading: false }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  generatePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const task = await api.post<TaskItem>(`/tasks/${id}/generate-plan`, {});
      set({ activeTask: task, loading: false });
      get().loadTasks();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  approvePlan: async (id, approved, comment) => {
    set({ loading: true, error: null });
    try {
      const task = await api.post<TaskItem>(`/tasks/${id}/approve`, { approved, comment });
      set({ activeTask: task, loading: false });
      if (approved) {
        api.post(`/tasks/${id}/execute`, {}).catch(() => {});
      }
      get().loadTasks();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  executeTask: async (id) => {
    try {
      await api.post(`/tasks/${id}/execute`, {});
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  finalReview: async (id, approved, comment) => {
    set({ loading: true });
    try {
      const task = await api.post<TaskItem>(`/tasks/${id}/review`, { approved, comment });
      set({ activeTask: task, loading: false });
      get().loadTasks();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed', loading: false });
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((s) => ({
        tasks: s.tasks.filter(t => t._id !== id),
        activeTask: s.activeTask?._id === id ? null : s.activeTask,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed' });
    }
  },

  pollTask: async (id) => {
    try {
      const task = await api.get<TaskItem>(`/tasks/${id}`);
      set((s) => ({
        activeTask: s.activeTask?._id === id ? task : s.activeTask,
        tasks: s.tasks.map(t => t._id === id ? task : t),
      }));
    } catch { /* ignore */ }
  },
}));
