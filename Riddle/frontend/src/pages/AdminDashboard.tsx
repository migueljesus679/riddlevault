import { useState } from 'react';
import { FiUsers, FiList, FiBarChart2 } from 'react-icons/fi';
import PlayerManager from '../components/admin/PlayerManager';
import RiddleManager from '../components/admin/RiddleManager';
import StatsPanel from '../components/admin/StatsPanel';

const TABS = [
  { id: 'players', label: 'Players', icon: <FiUsers /> },
  { id: 'riddles', label: 'Riddles', icon: <FiList /> },
  { id: 'stats',   label: 'Stats',   icon: <FiBarChart2 /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('players');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-mono font-bold text-3xl text-green-neon">Admin Dashboard</h1>
        <p className="text-gray-500 font-mono text-sm mt-1">Manage players, riddles, and view statistics.</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 font-mono text-sm px-4 py-2.5 border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-green-neon text-green-neon'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="card animate-fade-in">
        {tab === 'players' && <PlayerManager />}
        {tab === 'riddles' && <RiddleManager />}
        {tab === 'stats'   && <StatsPanel />}
      </div>
    </div>
  );
}
