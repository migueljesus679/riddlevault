import type { LeaderboardEntry } from '../types';
import { FiAward } from 'react-icons/fi';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard({ entries }: LeaderboardProps) {
  if (!entries.length) {
    return <p className="text-gray-500 font-mono text-center py-8">No players yet. Be the first!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-sm">
        <thead>
          <tr className="border-b border-border text-gray-500 text-left">
            <th className="py-3 px-4 w-12">Rank</th>
            <th className="py-3 px-4">Player</th>
            <th className="py-3 px-4 text-right">Solved</th>
            <th className="py-3 px-4 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={`border-b border-border/50 transition-colors hover:bg-card-hover ${entry.rank <= 3 ? 'bg-card-hover/30' : ''}`}
            >
              <td className="py-3 px-4 text-xl">{MEDAL[entry.rank] || <span className="text-gray-500">#{entry.rank}</span>}</td>
              <td className="py-3 px-4">
                <span className={entry.rank <= 3 ? 'text-amber-400 font-bold' : 'text-gray-200'}>{entry.username}</span>
              </td>
              <td className="py-3 px-4 text-right text-gray-400">{entry.solved_count}</td>
              <td className="py-3 px-4 text-right">
                <span className="flex items-center justify-end gap-1 text-green-neon font-bold">
                  <FiAward /> {entry.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
