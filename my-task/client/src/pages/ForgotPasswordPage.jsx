import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-card-darkBg rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-card-darkBorder space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Reset Password
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your account email to receive a password recovery link.
        </p>
      </div>

      {success ? (
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>Reset Link Sent</span>
          </div>
          <p>
            If an account matches {email}, we sent instructions to reset your password. Please check your inbox or developer console.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="text-primary font-semibold hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
