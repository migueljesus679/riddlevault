import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/play');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card border-border/60">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="font-mono font-bold text-2xl text-green-neon">Access Vault</h1>
            <p className="text-gray-500 font-mono text-sm mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Username</label>
              <input
                type="text"
                className="input-field"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="your_username"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Authenticating...' : 'Login →'}
            </button>
          </form>

          <p className="text-center font-mono text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-green-neon hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
