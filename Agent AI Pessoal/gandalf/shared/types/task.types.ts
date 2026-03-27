export type TaskStatus =
  | 'DRAFT_PLAN'
  | 'WAITING_APPROVAL'
  | 'RUNNING'
  | 'WAITING_FINAL_REVIEW'
  | 'DONE'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  plan: { steps: TaskStep[] };
  result?: string;
  createdAt?: string;
  completedAt?: string;
}
