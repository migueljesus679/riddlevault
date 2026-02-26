import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import type { AdminPlayer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiUser } from 'react-icons/fi';

export default function PlayerManager() {
  const { user, refreshUser } = useAuth();
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPoints, setEditPoints] = useState('');

  useEffect(() => { fetchPlayers(); }, []);

  async function fetchPlayers() {
    try {
      const { data } = await api.get<AdminPlayer[]>('/admin/players');
      setPlayers(data);
    } catch { toast.error('Failed to load players'); }
    finally { setLoading(false); }
  }

  async function updatePoints(id: number) {
    const pts = Number(editPoints);
    if (isNaN(pts) || pts < 0) return toast.error('Invalid points value');
    try {
      await api.patch(`/admin/players/${id}`, { points: pts });
      toast.success('Points updated');
      setEditingId(null);
      fetchPlayers();
      if (id === user?.id) await refreshUser();
    } catch { toast.error('Failed to update points'); }
  }

  async function toggleRole(p: AdminPlayer) {
    const newRole = p.role === 'admin' ? 'user' : 'admin';
    if (p.id === user?.id && newRole !== 'admin') {
      if (!confirm('You are demoting yourself from admin. You will lose admin access immediately. Continue?')) return;
    }
    try {
      await api.patch(`/admin/players/${p.id}`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchPlayers();
      if (p.id === user?.id) await refreshUser();
    } catch { toast.error('Failed to change role'); }
  }

  async function toggleBan(p: AdminPlayer) {
    try {
      await api.patch(`/admin/players/${p.id}`, { is_banned: !p.is_banned });
      toast.success(`Player ${p.is_banned ? 'unbanned' : 'banned'}`);
      fetchPlayers();
    } catch { toast.error('Failed to update player'); }
  }

  async function resetProgress(id: number) {
    if (!confirm('Reset all progress and points for this player?')) return;
    try {
      await api.delete(`/admin/players/${id}/progress`);
      toast.success('Progress reset');
      fetchPlayers();
      if (id === user?.id) await refreshUser();
    } catch { toast.error('Failed to reset progress'); }
  }

  async function deletePlayer(id: number) {
    if (!confirm('Permanently delete this player?')) return;
    try {
      await api.delete(`/admin/players/${id}`);
      toast.success('Player deleted');
      fetchPlayers();
    } catch { toast.error('Failed to delete player'); }
  }

  if (loading) return <div className="text-green-neon font-mono animate-pulse py-8 text-center">Loading players...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono font-bold text-green-neon">Players ({players.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b border-border text-gray-500 text-left">
              <th className="py-2 px-3">Username</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Points</th>
              <th className="py-2 px-3">Solved</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-card-hover">
                <td className="py-2 px-3 text-gray-200">{p.username}</td>
                <td className="py-2 px-3 text-gray-400 text-xs">{p.email}</td>

                {/* Role cell with toggle button */}
                <td className="py-2 px-3">
                  <button
                    onClick={() => toggleRole(p)}
                    title={`Switch to ${p.role === 'admin' ? 'Player' : 'Admin'}`}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-mono transition-all duration-150 ${
                      p.role === 'admin'
                        ? 'border-amber-500/50 text-amber-400 hover:bg-amber-900/20'
                        : 'border-gray-600/50 text-gray-400 hover:border-green-neon/50 hover:text-green-neon'
                    }`}
                  >
                    {p.role === 'admin' ? <FiShield size={11} /> : <FiUser size={11} />}
                    {p.role === 'admin' ? 'Admin' : 'Player'}
                  </button>
                </td>

                {/* Editable points */}
                <td className="py-2 px-3">
                  {editingId === p.id ? (
                    <div className="flex gap-1 items-center">
                      <input
                        type="number"
                        value={editPoints}
                        onChange={e => setEditPoints(e.target.value)}
                        className="input-field w-20 py-1 text-xs"
                        autoFocus
                      />
                      <button onClick={() => updatePoints(p.id)} className="text-green-neon hover:text-white text-xs px-1">✔</button>
                      <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-white text-xs px-1">✘</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(p.id); setEditPoints(String(p.points)); }}
                      className="text-amber-400 hover:text-white hover:underline"
                      title="Click to edit points"
                    >
                      {p.points}
                    </button>
                  )}
                </td>

                <td className="py-2 px-3 text-gray-400">{p.solved_count}</td>

                <td className="py-2 px-3">
                  <span className={p.is_banned ? 'text-red-400' : 'text-green-neon'}>
                    {p.is_banned ? 'Banned' : 'Active'}
                  </span>
                </td>

                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleBan(p)} className="text-xs text-yellow-400 hover:text-white font-mono">
                      {p.is_banned ? 'Unban' : 'Ban'}
                    </button>
                    <button onClick={() => resetProgress(p.id)} className="text-xs text-orange-400 hover:text-white font-mono">
                      Reset
                    </button>
                    <button onClick={() => deletePlayer(p.id)} className="text-xs text-red-400 hover:text-white font-mono">
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
