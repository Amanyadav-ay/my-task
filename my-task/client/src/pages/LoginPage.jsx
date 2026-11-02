import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-card-darkBg rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-card-darkBorder space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your credentials to access your productivity dashboard.
        </p>
      </div>

      {isExpired && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs">
          Your session expired. Please log in again to continue.
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
            <span>Remember me for 7 days</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300">Quick Demo Accounts (Password: Password123!)</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setEmail('student@mytask.local');
              setPassword('Password123!');
            }}
            className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          >
            Student Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('pro@mytask.local');
              setPassword('Password123!');
            }}
            className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
          >
            Professional Demo
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-bold hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
