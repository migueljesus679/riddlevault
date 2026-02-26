import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const TYPING_STRINGS_EN = ['Crack the Code.', 'Decrypt the Message.', 'Solve the Cipher.', 'Uncover the Secret.'];
const TYPING_STRINGS_PT = ['Decifra o Código.', 'Desencripta a Mensagem.', 'Resolve a Cifra.', 'Descobre o Segredo.'];

export default function Home() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [typed, setTyped] = useState('');
  const [strIdx, setStrIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const TYPING_STRINGS = lang === 'pt' ? TYPING_STRINGS_PT : TYPING_STRINGS_EN;

  useEffect(() => {
    setStrIdx(0); setCharIdx(0); setDeleting(false); setTyped('');
  }, [lang]);

  useEffect(() => {
    const current = TYPING_STRINGS[strIdx % TYPING_STRINGS.length];
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
  }, [charIdx, deleting, strIdx, TYPING_STRINGS]);

  const levels = [
    { icon: '🟢', label: t.home.easy, pts: 10, desc: t.home.easyDesc, color: 'border-green-600/40 hover:border-green-400' },
    { icon: '🟡', label: t.home.medium, pts: 25, desc: t.home.mediumDesc, color: 'border-yellow-600/40 hover:border-yellow-400' },
    { icon: '🟠', label: t.home.hard, pts: 50, desc: t.home.hardDesc, color: 'border-orange-600/40 hover:border-orange-400' },
    { icon: '🔴', label: t.home.ultimate, pts: 100, desc: t.home.ultimateDesc, color: 'border-red-600/40 hover:border-red-400' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute text-green-neon/5 font-mono text-xs animate-pulse-slow"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.3}s` }}>
              {['01', '10', '??', '##', '--', '..'][i % 6]}
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-block bg-green-neon/10 border border-green-neon/30 rounded-full px-4 py-1.5 font-mono text-xs text-green-neon mb-2">
            ▶ 20 {lang === 'pt' ? 'desafios criptográficos aguardam' : 'cryptographic challenges await'}
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
            {t.home.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link to="/play" className="btn-primary text-lg px-8 py-3">{t.home.startPlaying} →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-3">{t.home.startPlaying} →</Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-3">{t.nav.login}</Link>
              </>
            )}
            <Link to="/leaderboard" className="font-mono text-sm text-gray-500 hover:text-green-neon transition-colors underline underline-offset-4">
              {t.home.viewLeaderboard}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="font-mono text-gray-500 text-xs text-center mb-8 tracking-widest uppercase">
          {lang === 'pt' ? 'Quatro Níveis de Dificuldade' : 'Four Levels of Difficulty'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {levels.map(d => (
            <div key={d.label} className={`card border-2 ${d.color} transition-all duration-200 hover:bg-card-hover group`}>
              <div className="text-3xl mb-3">{d.icon}</div>
              <h3 className="font-mono font-bold text-lg text-white mb-1">{d.label}</h3>
              <p className="font-mono text-xs text-amber-400 mb-3">{d.pts} {t.home.pts}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
