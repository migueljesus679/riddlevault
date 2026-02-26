import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Riddle } from '../types';
import AnswerForm from '../components/AnswerForm';
import ProgressBar from '../components/ProgressBar';
import { FiArrowLeft, FiArrowRight, FiDownload } from 'react-icons/fi';

const DIFF_BADGE: Record<string, string> = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard', ultimate: 'badge-ultimate' };

export default function RiddlePage() {
  const { difficulty } = useParams<{ difficulty: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [riddles, setRiddles] = useState<Riddle[]>([]);
  const [loading, setLoading] = useState(true);

  const currentId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const currentIdx = currentId ? riddles.findIndex(r => r.id === currentId) : 0;
  const riddle = riddles[currentIdx >= 0 ? currentIdx : 0] || null;

  useEffect(() => {
    if (!difficulty) { navigate('/play'); return; }
    api.get<Riddle[]>(`/riddles?difficulty=${difficulty}`)
      .then(({ data }) => {
        setRiddles(data);
        if (!searchParams.get('id') && data.length > 0) {
          setSearchParams({ id: String(data[0].id) }, { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [difficulty]);

  async function handleAnswer(answer: string) {
    if (!riddle) return;
    try {
      const { data } = await api.post<{ correct: boolean; points_earned?: number; message: string; alreadySolved?: boolean }>(
        `/riddles/${riddle.id}/answer`,
        { answer }
      );
      if (data.correct) {
        toast.success(`${data.message}${data.points_earned ? ` (+${data.points_earned} pts)` : ''}`, { duration: 4000 });
        await refreshUser();
        setRiddles(prev => prev.map(r => r.id === riddle.id ? { ...r, solved: true } : r));
      } else {
        toast.error(data.message);
        setRiddles(prev => prev.map(r => r.id === riddle.id ? { ...r, attempts: r.attempts + 1 } : r));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
  }

  function navigate_to(idx: number) {
    if (idx >= 0 && idx < riddles.length) {
      setSearchParams({ id: String(riddles[idx].id) });
    }
  }

  const solved = riddles.filter(r => r.solved).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-green-neon font-mono animate-pulse">Loading riddles...</div>;
  }

  if (!riddles.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="font-mono text-gray-400">No riddles found for this difficulty.</p>
        <Link to="/play" className="btn-secondary mt-4 inline-block">← Back</Link>
      </div>
    );
  }

  const idx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb + progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-2 font-mono text-sm text-gray-500">
          <Link to="/play" className="hover:text-green-neon transition-colors">Play</Link>
          <span>/</span>
          <span className={`capitalize ${DIFF_BADGE[difficulty || '']}`}>{difficulty}</span>
        </div>
        <div className="w-full sm:w-64">
          <ProgressBar solved={solved} total={riddles.length} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Riddle list sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {riddles.map((r, i) => (
            <button
              key={r.id}
              onClick={() => navigate_to(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border font-mono text-sm transition-all duration-150 ${
                r.id === riddle?.id
                  ? 'border-green-neon/60 bg-green-neon/5 text-white'
                  : 'border-border hover:border-gray-600 text-gray-400 hover:text-gray-200 bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-gray-600">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate">{r.title}</span>
                </span>
                {r.solved && <span className="text-green-neon text-xs">✔</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Main riddle area */}
        <div className="lg:col-span-2 animate-slide-up">
          {riddle && (
            <div className="card border-border/80 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={DIFF_BADGE[riddle.difficulty]}>{riddle.difficulty}</span>
                  <h1 className="font-mono font-bold text-2xl text-white mt-2">{riddle.title}</h1>
                  <p className="font-mono text-xs text-amber-400 mt-1">{riddle.points_reward} points</p>
                </div>
                <div className="text-right font-mono text-xs text-gray-600">
                  {idx + 1} / {riddles.length}
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#0f0f1a] border border-border/50 rounded-lg p-5">
                <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{riddle.description}</pre>
              </div>

              {/* Stego image */}
              {riddle.image_path && (
                <div className="space-y-2">
                  <div className="relative group">
                    <img
                      src={`/images/${riddle.image_path}`}
                      alt="Riddle image — may contain hidden data"
                      className="w-full rounded-lg border border-border/50 max-h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <a
                        href={`/images/${riddle.image_path}`}
                        download={riddle.image_path}
                        className="flex items-center gap-2 bg-card border border-green-neon/50 text-green-neon font-mono text-sm px-4 py-2 rounded-lg hover:bg-green-neon/10"
                        onClick={e => e.stopPropagation()}
                      >
                        <FiDownload /> Download Image
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">Hover over image to download it for analysis</p>
                </div>
              )}

              {/* Attempts */}
              {riddle.attempts > 0 && !riddle.solved && (
                <div className="font-mono text-xs text-orange-400/70">
                  {riddle.attempts} incorrect attempt{riddle.attempts > 1 ? 's' : ''} — keep trying!
                </div>
              )}

              {/* Answer form */}
              <AnswerForm
                onSubmit={handleAnswer}
                hint={riddle.hint}
                solved={riddle.solved}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <button
                  onClick={() => navigate_to(idx - 1)}
                  disabled={idx === 0}
                  className="btn-secondary flex items-center gap-2 text-sm py-1.5 disabled:opacity-30"
                >
                  <FiArrowLeft /> Prev
                </button>
                <button
                  onClick={() => navigate_to(idx + 1)}
                  disabled={idx === riddles.length - 1}
                  className="btn-secondary flex items-center gap-2 text-sm py-1.5 disabled:opacity-30"
                >
                  Next <FiArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
