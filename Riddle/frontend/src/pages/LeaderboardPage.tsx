import { useState, useEffect } from 'react';
import api from '../api/client';
import type { LeaderboardEntry } from '../types';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<LeaderboardEntry[]>('/leaderboard').then(({ data }) => setEntries(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="font-mono font-bold text-3xl text-white mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-500 font-mono text-sm">Top solvers ranked by total points</p>
      </div>

      <div className="card animate-slide-up">
        {loading ? (
          <div className="text-center text-green-neon font-mono animate-pulse py-12">Loading rankings...</div>
        ) : (
          <Leaderboard entries={entries} />
        )}
      </div>
    </div>
  );
}
