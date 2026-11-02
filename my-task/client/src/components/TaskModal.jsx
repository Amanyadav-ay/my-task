import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Repeat,
  Paperclip,
  CheckSquare,
  Plus,
  Trash2,
  FileText,
  Target,
} from 'lucide-react';
import api from '../services/api.js';

export default function TaskModal({ isOpen, onClose, task = null, onSaved, categories = [], goals = [] }) {
  const isEditing = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [goalId, setGoalId] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('NEVER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategoryId(task.categoryId || '');
      setPriority(task.priority || 'MEDIUM');
      setStatus(task.status || 'PENDING');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setDueTime(task.dueTime || '');
      setEstimatedDuration(task.estimatedDuration ? String(task.estimatedDuration) : '');
      setGoalId(task.goalId || '');
      setNotes(task.notes || '');
      setSubtasks(task.subtasks || []);
      setRecurrenceFrequency(task.recurrence?.frequency || 'NEVER');
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPriority('MEDIUM');
      setStatus('PENDING');
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setDueTime('17:00');
      setEstimatedDuration('30');
      setGoalId('');
      setNotes('');
      setSubtasks([]);
      setRecurrenceFrequency('NEVER');
    }
    setError('');
  }, [task, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: 'temp-' + Date.now(), title: newSubtaskTitle.trim(), isCompleted: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index) => {
    setSubtasks((prev) =>
      prev.map((st, i) => (i === index ? { ...st, isCompleted: !st.isCompleted } : st))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        categoryId: categoryId || null,
        priority,
        status,
        dueDate: dueDate ? new Date(`${dueDate}T${dueTime || '12:00'}:00`).toISOString() : null,
        dueTime: dueTime || null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
        goalId: goalId || null,
        notes: notes.trim() || null,
        subtasks: subtasks.map((st) => ({ title: st.title, isCompleted: st.isCompleted })),
        recurrence: recurrenceFrequency !== 'NEVER' ? { frequency: recurrenceFrequency, interval: 1 } : null,
      };

      let res;
      if (isEditing) {
        res = await api.patch(`/tasks/${task.id}`, payload);
      } else {
        res = await api.post('/tasks', payload);
      }

      if (res.data?.success) {
        onSaved(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-card-darkBg rounded-3xl shadow-2xl border border-slate-200 dark:border-card-darkBorder w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete JavaScript project documentation"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:bg-white focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, deliverables, or checklist notes..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:bg-white focus:border-primary outline-none transition-all resize-none"
            />
          </div>

          {/* Grid: Priority, Category, Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-primary" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                Linked Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              >
                <option value="">No Goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Due Date, Due Time, Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="720"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="45"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Recurrence & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-primary" />
                Repeat Frequency
              </label>
              <select
                value={recurrenceFrequency}
                onChange={(e) => setRecurrenceFrequency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              >
                <option value="NEVER">Never (Single Task)</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-primary outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Subtasks ({subtasks.filter((s) => s.isCompleted).length}/{subtasks.length})</span>
            </label>

            {/* Subtask input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                placeholder="Add subtask step and press Enter..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Subtasks List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {subtasks.map((st, i) => (
                <div
                  key={st.id || i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(i)}
                      className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span className={st.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(i)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Personal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reference links, thoughts, or reminders..."
              className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
