import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Flag,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api.js';
import confetti from 'canvas-confetti';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Goal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career & Professional');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      const res = await api.get('/goals');
      if (res.data?.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      const res = await api.patch(`/goals/${goalId}/milestones/${milestoneId}`);
      if (res.data?.success) {
        if (res.data.data.progressPercentage === 100) {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
        }
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal and its milestones?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setCategory('Career & Professional');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    setTargetDate(futureDate.toISOString().split('T')[0]);
    setMilestones([
      { title: 'Learn foundations & theory', isCompleted: false },
      { title: 'Complete hands-on projects', isCompleted: false },
      { title: 'Review and pass assessment', isCompleted: false },
    ]);
    setError('');
    setIsModalOpen(true);
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    setMilestones((prev) => [...prev, { title: newMilestoneTitle.trim(), isCompleted: false }]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (idx) => {
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        milestones: milestones.map((m) => ({ title: m.title })),
      };

      if (editingGoal) {
        await api.patch(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post('/goals', payload);
      }

      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Long-Term Goals
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
              {goals.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Break big ambitions into structured milestones and track real execution progress.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* 2. Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder space-y-3">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No goals created yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            "Become a Full-Stack Developer", "Run a Marathon", or "Publish Research Paper". Define your target milestones today.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const completedMilestones = goal.milestones?.filter((m) => m.isCompleted).length || 0;
            const totalMilestones = goal.milestones?.length || 0;
            const progress = Math.round(goal.progressPercentage);

            return (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card flex flex-col justify-between space-y-4 hover:shadow-cardHover transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {goal.category || 'General Goal'}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {goal.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-primary" />
                        Milestones ({completedMilestones}/{totalMilestones})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {goal.milestones?.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(goal.id, m.id)}
                          className={`p-2 rounded-xl text-xs flex items-center gap-2.5 cursor-pointer border transition-all ${
                            m.isCompleted
                              ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={m.isCompleted}
                            onChange={() => {}} // handled by parent onClick
                            className="rounded text-green-600 focus:ring-green-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={`flex-1 truncate ${m.isCompleted ? 'line-through opacity-80' : ''}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Target:{' '}
                    {goal.targetDate
                      ? new Date(goal.targetDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Ongoing'}
                  </span>
                  <span>{goal.tasks?.length || 0} linked tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-card-darkBg rounded-3xl shadow-2xl border border-slate-200 dark:border-card-darkBorder w-full max-w-xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="flex-1 overflow-y-auto py-4 space-y-4">
              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Become a Full-Stack Web Developer"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this goal important? What is the expected outcome?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none"
                  >
                    <option value="Career & Professional">Career & Professional</option>
                    <option value="Academic & Learning">Academic & Learning</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Milestones Builder */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Milestones ({milestones.length})
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMilestone(e);
                      }
                    }}
                    placeholder="e.g. Master JavaScript asynchronous promises..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <span className="truncate">{m.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
