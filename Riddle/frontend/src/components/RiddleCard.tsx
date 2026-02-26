import { Link } from 'react-router-dom';
import type { Riddle } from '../types';
import { FiCheck, FiLock } from 'react-icons/fi';

interface RiddleCardProps {
  riddle: Riddle;
  index: number;
  difficulty: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'border-green-600/40 hover:border-green-400/60',
  medium: 'border-yellow-600/40 hover:border-yellow-400/60',
  hard: 'border-orange-600/40 hover:border-orange-400/60',
  ultimate: 'border-red-600/40 hover:border-red-400/60',
};

export default function RiddleCard({ riddle, index, difficulty }: RiddleCardProps) {
  const borderColor = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.easy;

  return (
    <Link
      to={`/play/${difficulty}?id=${riddle.id}`}
      className={`card border-2 ${borderColor} transition-all duration-200 hover:bg-card-hover group relative block`}
    >
      {riddle.solved && (
        <div className="absolute top-3 right-3 text-green-neon">
          <FiCheck className="text-xl" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="font-mono text-2xl font-bold text-gray-600 group-hover:text-gray-400 transition-colors min-w-[2.5rem]">
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-bold text-gray-200 group-hover:text-white transition-colors truncate">
            {riddle.title}
          </h3>
          <p className="text-xs text-gray-500 font-mono mt-1">
            {riddle.points_reward} pts
            {riddle.image_path && <span className="ml-2 text-amber-500">📷 image puzzle</span>}
            {riddle.attempts > 0 && !riddle.solved && (
              <span className="ml-2 text-orange-400">{riddle.attempts} attempt{riddle.attempts > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
