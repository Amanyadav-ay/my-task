import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  Timer,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

export default function SettingsPage() {
  const { user, updateProfile, updatePreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const { requestPushPermission } = useNotifications();

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [userType, setUserType] = useState(user?.userType || 'student');

  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences?.emailNotifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.preferences?.pushNotifications ?? false);
  const [pomodoroWork, setPomodoroWork] = useState(user?.preferences?.pomodoroWorkDuration || 25);
  const [pomodoroBreak, setPomodoroBreak] = useState(user?.preferences?.pomodoroShortBreak || 5);
  const [soundEnabled, setSoundEnabled] = useState(user?.preferences?.soundEnabled ?? true);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await updateProfile({
        name: name.trim(),
        userType,
      });

      await updatePreferences({
        theme,
        emailNotifications,
        pushNotifications,
        pomodoroWorkDuration: parseInt(pomodoroWork, 10),
        pomodoroShortBreak: parseInt(pomodoroBreak, 10),
        soundEnabled,
      });

      setStatusMessage({ type: 'success', text: 'Settings and profile saved successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePush = async (e) => {
    const checked = e.target.checked;
    setPushNotifications(checked);
    if (checked) {
      const granted = await requestPushPermission();
      if (!granted) {
        setStatusMessage({
          type: 'error',
          text: 'Push notifications permission denied or unsupported by this browser.',
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your profile, notification channels, dashboard layout, and focus timer durations.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* User Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Workspace Profile Layout
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'professional', label: 'Professional', icon: Briefcase },
                { id: 'freelancer', label: 'Freelancer', icon: Laptop },
                { id: 'personal', label: 'Personal Use', icon: User },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = userType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUserType(opt.id)}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Theme Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Sun className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notifications & Deadlines
            </h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Email Reminders</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive email alerts 1 day and 1 hour before scheduled task deadlines.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Browser Push Notifications
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time push alerts via Web Push API even when tab is in background.
                </p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={handleTogglePush}
                className="rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Pomodoro Timer Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Timer className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Focus Mode Timer Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Focus Sprint Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="90"
                value={pomodoroWork}
                onChange={(e) => setPomodoroWork(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Short Break Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={pomodoroBreak}
                onChange={(e) => setPomodoroBreak(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-1">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
            <span>Play audio chime when a focus session or break finishes</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
