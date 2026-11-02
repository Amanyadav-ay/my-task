import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Sparkles,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';

export default function Navbar({ onToggleSidebar, onQuickAdd, onOpenAI }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-card-darkBg border-b border-slate-200 dark:border-card-darkBorder sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, goals, tags... (Press Enter)"
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: Actions, Notifications, Theme, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Task Button */}
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold shadow-md shadow-primary/25 transition-all active:scale-95"
          title="Create New Task"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAI}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 text-xs sm:text-sm font-semibold hover:bg-purple-100 transition-all"
          title="AI Productivity Assistant"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI Assist</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-card-darkBg rounded-2xl shadow-xl border border-slate-200 dark:border-card-darkBorder z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary mt-1">
                  {user?.userType || 'Personal'} Plan
                </span>
              </div>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Account
              </button>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Preferences & Theme
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
