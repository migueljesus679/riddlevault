import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiAward, FiShield } from 'react-icons/fi';
import { GiLockedDoor } from 'react-icons/gi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
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
            <NavLink to="/" label="Home" />
            {user && <NavLink to="/play" label="Play" />}
            <NavLink to="/leaderboard" label="Leaderboard" />
            {isAdmin && <NavLink to="/admin" label="Admin" icon={<FiShield />} />}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <FiAward className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{user.points}</span>
                  <span className="text-gray-400">pts</span>
                  <span className="text-border mx-1">|</span>
                  <span className="text-gray-300">{user.username}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Register</Link>
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
          <MobileLink to="/" label="Home" onClick={() => setOpen(false)} />
          {user && <MobileLink to="/play" label="Play" onClick={() => setOpen(false)} />}
          <MobileLink to="/leaderboard" label="Leaderboard" onClick={() => setOpen(false)} />
          {isAdmin && <MobileLink to="/admin" label="Admin" onClick={() => setOpen(false)} />}
          <div className="pt-2 border-t border-border">
            {user ? (
              <div className="space-y-2">
                <div className="font-mono text-sm text-amber-400">{user.username} · {user.points} pts</div>
                <button onClick={handleLogout} className="btn-danger w-full text-left">Logout</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm flex-1 text-center">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm flex-1 text-center">Register</Link>
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
