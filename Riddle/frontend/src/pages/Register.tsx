import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', form);
      login(data.token, data.user);
      toast.success('Account created! Welcome to RiddleVault!');
      navigate('/play');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card border-border/60">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🗝️</div>
            <h1 className="font-mono font-bold text-2xl text-green-neon">Create Account</h1>
            <p className="text-gray-500 font-mono text-sm mt-2">Join the vault and start solving</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Username (3–20 chars)</label>
              <input
                type="text"
                className="input-field"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="your_username"
                minLength={3}
                maxLength={20}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Password (min 6 chars)</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Register →'}
            </button>
          </form>

          <p className="text-center font-mono text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-neon hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
