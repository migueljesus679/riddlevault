import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import type { Riddle } from '../../types';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const BLANK_FORM = {
  title: '', description: '', difficulty: 'easy', answer: '',
  hint: '', image_path: '', points_reward: 10, order_index: 0, is_active: true,
};
type FormState = typeof BLANK_FORM;

interface AdminRiddle extends Riddle { answer_plain?: string }

export default function RiddleManager() {
  const [riddles, setRiddles] = useState<AdminRiddle[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  useEffect(() => { fetchRiddles(); }, []);

  async function fetchRiddles() {
    try {
      const { data } = await api.get<AdminRiddle[]>('/admin/riddles');
      setRiddles(data);
    } catch { toast.error('Failed to load riddles'); }
    finally { setLoading(false); }
  }

  function toggleReveal(id: number) {
    setRevealedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startEdit(r: AdminRiddle) {
    setForm({
      title: r.title, description: r.description, difficulty: r.difficulty,
      answer: '', hint: r.hint, image_path: r.image_path || '',
      points_reward: r.points_reward, order_index: r.order_index, is_active: r.is_active === 1,
    });
    setEditId(r.id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(BLANK_FORM);
    setEditId(null);
    setShowForm(false);
  }

  async function saveRiddle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.difficulty) return toast.error('Fill required fields');
    if (!editId && !form.answer) return toast.error('Answer is required for new riddles');
    try {
      const payload = { ...form, image_path: form.image_path || null, is_active: form.is_active ? 1 : 0 };
      if (editId) {
        await api.put(`/admin/riddles/${editId}`, payload);
        toast.success('Riddle updated');
      } else {
        await api.post('/admin/riddles', payload);
        toast.success('Riddle created');
      }
      cancelForm();
      fetchRiddles();
    } catch { toast.error('Failed to save riddle'); }
  }

  async function deleteRiddle(id: number) {
    if (!confirm('Delete this riddle permanently?')) return;
    try {
      await api.delete(`/admin/riddles/${id}`);
      toast.success('Riddle deleted');
      fetchRiddles();
    } catch { toast.error('Failed to delete riddle'); }
  }

  const diffClass: Record<string, string> = {
    easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard', ultimate: 'badge-ultimate',
  };

  if (loading) return <div className="text-green-neon font-mono animate-pulse py-8 text-center">Loading riddles...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono font-bold text-green-neon">Riddles ({riddles.length})</h2>
        <button onClick={() => { cancelForm(); setShowForm(!showForm); }} className="btn-primary text-sm py-1.5">
          {showForm && !editId ? 'Cancel' : '+ New Riddle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveRiddle} className="card border-green-neon/30 space-y-3 animate-slide-up">
          <h3 className="font-mono text-green-neon font-bold">{editId ? 'Edit Riddle' : 'New Riddle'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-mono">Title *</label>
              <input className="input-field mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono">Difficulty *</label>
              <select className="input-field mt-1" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                {['easy', 'medium', 'hard', 'ultimate'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-mono">Description *</label>
            <textarea rows={4} className="input-field mt-1 resize-y" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-mono">
                Answer {editId ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                className="input-field mt-1"
                value={form.answer}
                onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                placeholder="Plain text — will be hashed automatically"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono">Points</label>
              <input type="number" className="input-field mt-1" value={form.points_reward} onChange={e => setForm(f => ({ ...f, points_reward: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-mono">Hint</label>
            <textarea rows={2} className="input-field mt-1 resize-y" value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-mono">Image filename (optional)</label>
              <input className="input-field mt-1" value={form.image_path} placeholder="e.g. riddle_16.png" onChange={e => setForm(f => ({ ...f, image_path: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-mono">Order index</label>
              <input type="number" className="input-field mt-1" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 font-mono text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-green-neon" />
            <span className="text-gray-300">Active</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={cancelForm} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b border-border text-gray-500 text-left">
              <th className="py-2 px-3">Title</th>
              <th className="py-2 px-3">Level</th>
              <th className="py-2 px-3">Answer</th>
              <th className="py-2 px-3">Pts</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {riddles.map(r => {
              const revealed = revealedIds.has(r.id);
              return (
                <tr key={r.id} className="border-b border-border/50 hover:bg-card-hover">
                  <td className="py-2 px-3 text-gray-200 max-w-[200px] truncate">{r.title}</td>
                  <td className="py-2 px-3"><span className={diffClass[r.difficulty]}>{r.difficulty}</span></td>

                  {/* Answer column with reveal toggle */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs transition-all ${revealed ? 'text-green-neon' : 'text-transparent select-none bg-gray-700 rounded px-1'}`}
                        style={{ filter: revealed ? 'none' : 'blur(4px)' }}
                      >
                        {r.answer_plain || '—'}
                      </span>
                      <button
                        onClick={() => toggleReveal(r.id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                        title={revealed ? 'Hide answer' : 'Reveal answer'}
                      >
                        {revealed ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                      </button>
                    </div>
                  </td>

                  <td className="py-2 px-3 text-amber-400">{r.points_reward}</td>
                  <td className="py-2 px-3">
                    <span className={r.is_active ? 'text-green-neon' : 'text-red-400'}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)} className="text-xs text-blue-400 hover:text-white font-mono">Edit</button>
                      <button onClick={() => deleteRiddle(r.id)} className="text-xs text-red-400 hover:text-white font-mono">Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
