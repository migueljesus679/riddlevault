import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { Riddle, Difficulty } from '../types';
import ProgressBar from '../components/ProgressBar';
import { useLang } from '../context/LanguageContext';

export default function GameLobby() {
  const { t, lang } = useLang();
  const [riddles, setRiddles] = useState<Riddle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Riddle[]>('/riddles').then(({ data }) => setRiddles(data)).finally(() => setLoading(false));
  }, []);

  const LEVELS: { key: Difficulty; label: string; icon: string; desc: string; color: string; progress: string }[] = [
    { key: 'easy',     label: t.difficulty.easy,     icon: '🟢', desc: t.home.easyDesc,     color: 'border-green-600/50 hover:border-green-400/80 hover:bg-green-900/10',  progress: 'bg-green-400' },
    { key: 'medium',   label: t.difficulty.medium,   icon: '🟡', desc: t.home.mediumDesc,   color: 'border-yellow-600/50 hover:border-yellow-400/80 hover:bg-yellow-900/10', progress: 'bg-yellow-400' },
    { key: 'hard',     label: t.difficulty.hard,     icon: '🟠', desc: t.home.hardDesc,     color: 'border-orange-600/50 hover:border-orange-400/80 hover:bg-orange-900/10', progress: 'bg-orange-400' },
    { key: 'ultimate', label: t.difficulty.ultimate, icon: '🔴', desc: t.home.ultimateDesc, color: 'border-red-600/50 hover:border-red-400/80 hover:bg-red-900/10',    progress: 'bg-red-400' },
  ];

  const byDiff = (d: Difficulty) => riddles.filter(r => r.difficulty === d);
  const solvedCount = (d: Difficulty) => byDiff(d).filter(r => r.solved).length;
  const totalPoints = riddles.filter(r => r.solved).reduce((sum, r) => sum + r.points_reward, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="font-mono font-bold text-3xl text-white mb-2">{t.lobby.title}</h1>
        <p className="text-gray-500 font-mono text-sm">
          {loading ? '...' : `${riddles.filter(r => r.solved).length} / ${riddles.length} · ${totalPoints} pts`}
        </p>
      </div>

      {loading ? (
        <div className="text-center text-green-neon font-mono animate-pulse py-20">...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          {LEVELS.map(level => {
            const levelRiddles = byDiff(level.key);
            const solved = solvedCount(level.key);
            const ptsPerRiddle = levelRiddles[0]?.points_reward ?? 0;
            return (
              <Link
                key={level.key}
                to={`/play/${level.key}`}
                className={`card border-2 ${level.color} transition-all duration-200 group relative overflow-hidden block`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-60 transition-opacity" />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{level.icon}</span>
                    <div>
                      <h2 className="font-mono font-bold text-xl text-white group-hover:text-green-neon transition-colors">{level.label}</h2>
                      <span className="font-mono text-xs text-amber-400">{ptsPerRiddle > 0 ? `${ptsPerRiddle} pts` : ''}</span>
                    </div>
                  </div>
                  {solved === levelRiddles.length && levelRiddles.length > 0 && (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{level.desc}</p>
                <ProgressBar solved={solved} total={levelRiddles.length} color={level.progress} />

                <div className="mt-4 text-right font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                  {lang === 'pt' ? 'Entrar →' : 'Enter →'}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
