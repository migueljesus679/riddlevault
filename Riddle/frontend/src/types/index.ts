export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  is_banned: number;
  created_at: string;
}

export interface Riddle {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'ultimate';
  hint: string;
  image_path: string | null;
  points_reward: number;
  order_index: number;
  is_active?: number;
  answer_plain?: string;
  solved: boolean;
  attempts: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  points: number;
  solved_count: number;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_solves: number;
  total_points: number;
  riddle_stats: {
    id: number;
    title: string;
    difficulty: string;
    points_reward: number;
    solve_count: number;
    avg_attempts: number;
  }[];
}

export interface AdminPlayer extends User {
  solved_count: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'ultimate';
