import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength check
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  const isPasswordStrong = hasUpperCase && hasLowerCase && hasNumber && hasMinLength;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to create an account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isPasswordStrong) {
      setError('Please meet all password strength requirements.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        userType,
      });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-card-darkBg rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-card-darkBorder space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Create Your Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Start organizing your tasks, schedule, and goals in one place.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* User Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            How will you primarily use My Task?
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'student', label: 'Student' },
              { id: 'professional', label: 'Professional' },
              { id: 'freelancer', label: 'Freelancer' },
              { id: 'personal', label: 'Personal Use' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setUserType(type.id)}
                className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                  userType === type.id
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 chars (Uppercase, lowercase, number)"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* Password strength hints */}
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-green-600 font-bold' : ''}`}>
                <CheckCircle2 className="w-3 h-3" /> 8+ characters
              </span>
              <span className={`flex items-center gap-1 ${hasUpperCase ? 'text-green-600 font-bold' : ''}`}>
                <CheckCircle2 className="w-3 h-3" /> 1 uppercase
              </span>
              <span className={`flex items-center gap-1 ${hasLowerCase ? 'text-green-600 font-bold' : ''}`}>
                <CheckCircle2 className="w-3 h-3" /> 1 lowercase
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-green-600 font-bold' : ''}`}>
                <CheckCircle2 className="w-3 h-3" /> 1 number
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
          />
          <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            I accept the{' '}
            <span className="text-primary font-semibold hover:underline">
              Terms & Conditions
            </span>{' '}
            and Privacy Policy.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !termsAccepted}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
