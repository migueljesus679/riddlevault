import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { FiMenu, FiX, FiLogOut, FiAward, FiShield } from 'react-icons/fi';
import { GiLockedDoor } from 'react-icons/gi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setOpen(false);
  }

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <GiLockedDoor className="text-green-neon text-2xl group-hover:animate-spin transition-transform" />
            <span className="font-mono font-bold text-lg text-green-neon tracking-wider">RiddleVault</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" label={t.nav.home} />
            {user && <NavLink to="/play" label={t.nav.play} />}
            <NavLink to="/leaderboard" label={t.nav.leaderboard} />
            {isAdmin && <NavLink to="/admin" label={t.nav.admin} icon={<FiShield />} />}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
              className="font-mono text-xs border border-border/60 hover:border-green-neon/50 text-gray-400 hover:text-green-neon px-2.5 py-1 rounded transition-colors"
              title="Switch language"
            >
              {lang === 'en' ? '🇵🇹 PT' : '🇬🇧 EN'}
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <FiAward className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{user.points}</span>
                  <span className="text-gray-400">{t.nav.pts}</span>
                  <span className="text-border mx-1">|</span>
                  <span className="text-gray-300">{user.username}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                  <FiLogOut /> {t.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5">{t.nav.login}</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">{t.nav.register}</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4 space-y-2 animate-fade-in">
          <MobileLink to="/" label={t.nav.home} onClick={() => setOpen(false)} />
          {user && <MobileLink to="/play" label={t.nav.play} onClick={() => setOpen(false)} />}
          <MobileLink to="/leaderboard" label={t.nav.leaderboard} onClick={() => setOpen(false)} />
          {isAdmin && <MobileLink to="/admin" label={t.nav.admin} onClick={() => setOpen(false)} />}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
              className="font-mono text-xs border border-border/60 text-gray-400 px-2.5 py-1 rounded mb-2"
            >
              {lang === 'en' ? '🇵🇹 PT' : '🇬🇧 EN'}
            </button>
            {user ? (
              <div className="space-y-2">
                <div className="font-mono text-sm text-amber-400">{user.username} · {user.points} {t.nav.pts}</div>
                <button onClick={handleLogout} className="btn-danger w-full text-left">{t.nav.logout}</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm flex-1 text-center">{t.nav.login}</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm flex-1 text-center">{t.nav.register}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  return (
    <Link to={to} className="font-mono text-sm text-gray-400 hover:text-green-neon transition-colors flex items-center gap-1">
      {icon}{label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="block font-mono text-sm text-gray-400 hover:text-green-neon py-2 transition-colors">
      {label}
    </Link>
  );
}
