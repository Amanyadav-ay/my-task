import React, { useState } from 'react';
import { X, Calendar, AlertCircle, ArrowRight, Clock, Check } from 'lucide-react';
import api from '../services/api.js';

export default function RescheduleModal({ isOpen, onClose, task, onRescheduled }) {
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('17:00');
  const [rescheduleSubtasks, setRescheduleSubtasks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  // Preset quick date options
  const handlePreset = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setNewDate(d.toISOString().split('T')[0]);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fullDueDate = new Date(`${newDate}T${newTime || '12:00'}:00`).toISOString();
      const res = await api.patch(`/tasks/${task.id}`, {
        dueDate: fullDueDate,
        dueTime: newTime,
        status: 'PENDING', // Clears overdue status
      });

      if (res.data?.success) {
        onRescheduled(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-card-darkBg rounded-3xl shadow-2xl border border-slate-200 dark:border-card-darkBorder w-full max-w-lg p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Smart Reschedule Task
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick a new realistic target date without losing progress.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Info Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs">
          <p className="font-bold text-amber-900 dark:text-amber-300 truncate">{task.title}</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
            Original Due Date:{' '}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'} (Overdue)
          </p>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        {/* Presets */}
        <div className="mt-4 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Suggestions
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePreset(1)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handlePreset(3)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center"
            >
              In 3 Days
            </button>
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center"
            >
              Next Week
            </button>
          </div>
        </div>

        {/* Date / Time Inputs */}
        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Deadline Date
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rescheduleSubtasks}
              onChange={(e) => setRescheduleSubtasks(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4"
            />
            <span>Also shift pending subtasks to new deadline window</span>
          </label>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
