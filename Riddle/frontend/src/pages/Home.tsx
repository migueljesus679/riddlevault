import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TYPING_STRINGS = [
  'Crack the Code.',
  'Decrypt the Message.',
  'Solve the Cipher.',
  'Uncover the Secret.',
];

export default function Home() {
  const { user } = useAuth();
  const [typed, setTyped] = useState('');
  const [strIdx, setStrIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = TYPING_STRINGS[strIdx];
    const timeout = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setTyped(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setTimeout(() => setDeleting(true), 1600);
      } else if (deleting && charIdx > 0) {
        setTyped(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else if (deleting && charIdx === 0) {
        setDeleting(false);
        setStrIdx(i => (i + 1) % TYPING_STRINGS.length);
      }
    }, deleting ? 50 : 90);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, strIdx]);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-green-neon/5 font-mono text-xs animate-pulse-slow"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.3}s` }}
            >
              {['01', '10', '??', '##', '--', '..'][i % 6]}
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-block bg-green-neon/10 border border-green-neon/30 rounded-full px-4 py-1.5 font-mono text-xs text-green-neon mb-2">
            ▶ 20 cryptographic challenges await
          </div>

          <h1 className="text-5xl md:text-7xl font-mono font-bold text-white animate-glitch leading-tight">
            Riddle<span className="text-green-neon">Vault</span>
          </h1>

          <div className="h-12 flex items-center justify-center">
            <p className="font-mono text-xl md:text-2xl text-gray-300">
              {typed}<span className="text-green-neon animate-pulse">█</span>
            </p>
          </div>

          <p className="text-gray-500 font-mono text-sm max-w-xl mx-auto leading-relaxed">
            Four levels of mind-bending riddles — from classic wordplay to Morse Code, Vigenère Ciphers,
            Steganography, PGP armor, and beyond. Do you have what it takes?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link to="/play" className="btn-primary text-lg px-8 py-3">Enter the Vault →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-3">Start Your Journey →</Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-3">Sign In</Link>
              </>
            )}
            <Link to="/leaderboard" className="font-mono text-sm text-gray-500 hover:text-green-neon transition-colors underline underline-offset-4">
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Difficulty cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-mono text-gray-500 text-xs text-center mb-8 tracking-widest uppercase">Four Levels of Difficulty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { level: 'Easy', pts: 10, icon: '🟢', desc: 'Classic riddles and wordplay. A warm-up for the mind.', color: 'border-green-600/40 hover:border-green-400' },
            { level: 'Medium', pts: 25, icon: '🟡', desc: 'Logic puzzles and lateral thinking challenges.', color: 'border-yellow-600/40 hover:border-yellow-400' },
            { level: 'Hard', pts: 50, icon: '🟠', desc: 'Morse Code, Caesar cipher, Vigenère, Binary, and Hex.', color: 'border-orange-600/40 hover:border-orange-400' },
            { level: 'Ultimate', pts: 100, icon: '🔴', desc: 'Steganography, PGP armor, multi-step ciphers. For the elite.', color: 'border-red-600/40 hover:border-red-400' },
          ].map(d => (
            <div key={d.level} className={`card border-2 ${d.color} transition-all duration-200 hover:bg-card-hover group`}>
              <div className="text-3xl mb-3">{d.icon}</div>
              <h3 className="font-mono font-bold text-lg text-white mb-1">{d.level}</h3>
              <p className="font-mono text-xs text-amber-400 mb-3">{d.pts} pts per riddle</p>
              <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <h2 className="font-mono text-gray-500 text-xs tracking-widest uppercase mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Register', desc: 'Create your account to track progress and compete on the leaderboard.' },
            { step: '02', title: 'Solve', desc: 'Pick a difficulty, read the riddle, and submit your answer. Hints are available.' },
            { step: '03', title: 'Climb', desc: 'Earn points for every correct answer and rise through the ranks.' },
          ].map(s => (
            <div key={s.step} className="space-y-2">
              <div className="text-4xl font-mono font-bold text-green-neon/20">{s.step}</div>
              <h3 className="font-mono font-bold text-white">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
