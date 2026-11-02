import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CheckSquare, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-main-bg dark:bg-main-darkBg text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors">
      {/* Header bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
              MY TASK
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Productivity Platform
            </span>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">
        © 2026 MY TASK. Plan Your Day. Track Your Progress. Achieve Your Goals.
      </footer>
    </div>
  );
}
