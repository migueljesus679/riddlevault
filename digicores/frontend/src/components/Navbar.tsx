import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Category } from '../types';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCatOpen(false);
  }, [location]);

  return (
    <header className="bg-dark-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-500 text-white font-black text-lg px-3 py-1 rounded">
              DIGI
            </div>
            <span className="font-bold text-xl tracking-tight">CORES</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary-500 transition-colors">Início</Link>

            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <Link to="/produtos" className="hover:text-primary-500 transition-colors flex items-center gap-1">
                Produtos
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {catOpen && (
                <div className="absolute top-full left-0 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 p-2 min-w-[220px]">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/produtos?categoria=${cat.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3 text-sm">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-primary-500 hover:text-primary-400 font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Back Office
                  </Link>
                )}
                <span className="text-gray-300">Olá, <strong>{user.name.split(' ')[0]}</strong></span>
                <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Entrar</Link>
                <Link to="/registo" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg font-medium transition-colors">
                  Registar
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-dark-900 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-dark-900 py-3 pb-4 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-lg hover:bg-dark-900 text-sm">Início</Link>
            <Link to="/produtos" className="block px-3 py-2 rounded-lg hover:bg-dark-900 text-sm">Todos os Produtos</Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/produtos?categoria=${cat.slug}`} className="block px-6 py-1.5 text-gray-400 hover:text-white text-sm">
                {cat.icon} {cat.name}
              </Link>
            ))}
            <div className="border-t border-dark-900 pt-3 mt-2">
              {user ? (
                <>
                  {user.role === 'admin' && <Link to="/admin" className="block px-3 py-2 rounded-lg hover:bg-dark-900 text-sm text-primary-500">Back Office</Link>}
                  <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-dark-900 text-sm text-gray-400">Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-lg hover:bg-dark-900 text-sm">Entrar</Link>
                  <Link to="/registo" className="block px-3 py-2 rounded-lg hover:bg-dark-900 text-sm text-primary-500">Registar</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
