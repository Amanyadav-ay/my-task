import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, AlertCircle, Award, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.jsx';

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'DEADLINE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'COMPLETION':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.taskId) {
      navigate(`/tasks?id=${notification.taskId}`);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-card-darkBg rounded-2xl shadow-2xl border border-slate-200 dark:border-card-darkBorder z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No notifications yet</p>
            <p className="text-xs mt-1">You're all caught up with your deadlines!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                !n.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={`text-xs font-bold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {n.message}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
