import { useState, useEffect } from 'react';
import api from '../../api/client';
import type { AdminStats } from '../../types';

const DIFF_COLORS: Record<string, string> = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-orange-400', ultimate: 'text-red-400' };

export default function StatsPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminStats>('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-green-neon font-mono animate-pulse py-8 text-center">Loading stats...</div>;
  if (!stats) return <div className="text-red-400 font-mono text-center py-8">Failed to load stats.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Players', value: stats.total_users, color: 'text-green-neon' },
          { label: 'Total Solves', value: stats.total_solves, color: 'text-amber-400' },
          { label: 'Points Awarded', value: stats.total_points.toLocaleString(), color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={`text-3xl font-mono font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 font-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-mono font-bold text-green-neon mb-3">Per-Riddle Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-border text-gray-500 text-left">
                <th className="py-2 px-3">Riddle</th>
                <th className="py-2 px-3">Level</th>
                <th className="py-2 px-3">Pts</th>
                <th className="py-2 px-3 text-right">Solves</th>
                <th className="py-2 px-3 text-right">Avg Attempts</th>
                <th className="py-2 px-3 text-right">Solve Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.riddle_stats.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-card-hover">
                  <td className="py-2 px-3 text-gray-200 max-w-xs truncate">{r.title}</td>
                  <td className="py-2 px-3"><span className={DIFF_COLORS[r.difficulty] || 'text-gray-400'}>{r.difficulty}</span></td>
                  <td className="py-2 px-3 text-amber-400">{r.points_reward}</td>
                  <td className="py-2 px-3 text-right text-green-neon">{r.solve_count}</td>
                  <td className="py-2 px-3 text-right text-gray-400">{r.avg_attempts ?? '—'}</td>
                  <td className="py-2 px-3 text-right">
                    {stats.total_users > 0 ? (
                      <span className="text-gray-400">{Math.round((r.solve_count / stats.total_users) * 100)}%</span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
