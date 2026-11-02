import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SunMedium,
  CheckSquare,
  Target,
  Calendar,
  Timer,
  BarChart3,
  Award,
  Settings,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ isOpen, setIsOpen, onOpenAI }) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Day', path: '/my-day', icon: SunMedium },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Focus Timer', path: '/focus', icon: Timer },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const profileBadgeColor = {
    student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    professional: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    freelancer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    personal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }[user?.userType || 'personal'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#161E2E] text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1">
                  MY TASK
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                  Plan. Track. Achieve.
                </span>
              </div>
            )}
          </NavLink>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* AI Assistant Quick Pill */}
        <div className="px-3 pt-4">
          <button
            onClick={onOpenAI}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-purple-600/20 hover:from-primary/30 hover:to-purple-600/30 border border-primary/40 text-purple-200 transition-all group ${
              !isOpen && 'justify-center px-0'
            }`}
            title="Open AI Productivity Assistant"
          >
            <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform shrink-0" />
            {isOpen && (
              <span className="text-xs font-semibold tracking-wide flex items-center justify-between w-full">
                AI Assistant
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-white font-bold">
                  AI
                </span>
              </span>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  } ${!isOpen && 'justify-center px-0'}`
                }
                title={!isOpen ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 ${
              !isOpen && 'justify-center p-1'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] capitalize px-1.5 py-0.2 rounded border font-medium truncate ${profileBadgeColor}`}
                  >
                    {user?.userType || 'Personal'}
                  </span>
                </div>
              </div>
            )}
            {isOpen && (
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
