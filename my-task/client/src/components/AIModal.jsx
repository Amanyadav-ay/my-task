import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ListTodo,
  Calendar,
  Lightbulb,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import api from '../services/api.js';

export default function AIModal({ isOpen, onClose, onTasksImported }) {
  const [tab, setTab] = useState('breakdown'); // breakdown | schedule | suggestions

  // Breakdown state
  const [prompt, setPrompt] = useState('I want to learn Full-Stack Web Development in 10 days');
  const [days, setDays] = useState(10);
  const [breakdownResult, setBreakdownResult] = useState(null);
  const [selectedPlanDays, setSelectedPlanDays] = useState([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [savingTasks, setSavingTasks] = useState(false);

  // Schedule state
  const [scheduleResult, setScheduleResult] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleGenerateBreakdown = async () => {
    if (!prompt.trim()) return;
    setLoadingBreakdown(true);
    setMessage('');
    try {
      const res = await api.post('/ai/breakdown', { prompt: prompt.trim(), days });
      if (res.data?.success) {
        setBreakdownResult(res.data.data);
        // Default select all generated days
        setSelectedPlanDays(res.data.data.dailyPlan.map((_, i) => i));
      }
    } catch (err) {
      setMessage('Failed to generate plan. Please try again.');
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleSaveBreakdownTasks = async () => {
    if (!breakdownResult || selectedPlanDays.length === 0) return;
    setSavingTasks(true);
    try {
      const today = new Date();
      const tasksToCreate = breakdownResult.dailyPlan.filter((_, idx) =>
        selectedPlanDays.includes(idx)
      );

      for (let i = 0; i < tasksToCreate.length; i++) {
        const item = tasksToCreate[i];
        const taskDueDate = new Date(today);
        taskDueDate.setDate(today.getDate() + (item.day - 1));
        taskDueDate.setHours(17, 0, 0, 0);

        await api.post('/tasks', {
          title: item.title,
          description: item.description,
          priority: item.priority || 'MEDIUM',
          estimatedDuration: item.estimatedDuration || 45,
          dueDate: taskDueDate.toISOString(),
          dueTime: '17:00',
          subtasks: item.subtasks ? item.subtasks.map((st) => ({ title: st })) : [],
        });
      }

      onTasksImported?.();
      setMessage(`Successfully added ${tasksToCreate.length} daily tasks to your schedule!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMessage('Error saving tasks to database.');
    } finally {
      setSavingTasks(false);
    }
  };

  const handleLoadSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await api.post('/ai/schedule');
      if (res.data?.success) {
        setScheduleResult(res.data.data);
      }
    } catch (err) {
      //
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleLoadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await api.get('/ai/suggestions');
      if (res.data?.success) {
        setSuggestions(res.data.data);
      }
    } catch (err) {
      //
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-card-darkBg rounded-3xl shadow-2xl border border-slate-200 dark:border-card-darkBorder w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-transparent dark:from-purple-950/20 dark:via-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-md shadow-primary/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                AI Productivity Assistant
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Smart Heuristics & LLM
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Break down projects, balance your schedule, and optimize your focus.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setTab('breakdown')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              tab === 'breakdown'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Task Breakdown
          </button>
          <button
            onClick={() => {
              setTab('schedule');
              if (!scheduleResult) handleLoadSchedule();
            }}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              tab === 'schedule'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Smart Scheduling
          </button>
          <button
            onClick={() => {
              setTab('suggestions');
              if (!suggestions) handleLoadSuggestions();
            }}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              tab === 'suggestions'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Productivity Insights
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {message && (
            <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              {message}
            </div>
          )}

          {/* TAB 1: BREAKDOWN */}
          {tab === 'breakdown' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  What complex goal or project do you want to break down?
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Master React in 10 days, Complete Semester Project..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none"
                    >
                      <option value={3}>3 Days</option>
                      <option value={5}>5 Days</option>
                      <option value={7}>7 Days</option>
                      <option value={10}>10 Days</option>
                      <option value={14}>14 Days</option>
                      <option value={30}>30 Days</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleGenerateBreakdown}
                      disabled={loadingBreakdown || !prompt.trim()}
                      className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {loadingBreakdown ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {breakdownResult && (
                <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                    <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300">
                      {breakdownResult.title}
                    </h3>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                      {breakdownResult.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Generated {breakdownResult.dailyPlan.length} milestones. Select tasks to add to your calendar:
                    </span>
                    <button
                      onClick={() => {
                        if (selectedPlanDays.length === breakdownResult.dailyPlan.length) {
                          setSelectedPlanDays([]);
                        } else {
                          setSelectedPlanDays(breakdownResult.dailyPlan.map((_, i) => i));
                        }
                      }}
                      className="text-primary font-semibold hover:underline"
                    >
                      {selectedPlanDays.length === breakdownResult.dailyPlan.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {breakdownResult.dailyPlan.map((day, idx) => {
                      const isSelected = selectedPlanDays.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPlanDays((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/5 dark:bg-primary/10 border-primary/40'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent onClick
                              className="mt-1 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {day.title}
                                </h4>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  Day {day.day}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {day.description}
                              </p>
                              {day.subtasks && day.subtasks.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {day.subtasks.map((st, sIdx) => (
                                    <li
                                      key={sIdx}
                                      className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                      <span>{st}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveBreakdownTasks}
                      disabled={savingTasks || selectedPlanDays.length === 0}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/25 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingTasks ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Adding to Tasks...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add {selectedPlanDays.length} Tasks to My Schedule</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SMART SCHEDULING */}
          {tab === 'schedule' && (
            <div className="space-y-4">
              {loadingSchedule ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Analyzing deadlines, duration estimates, and workload balance...</p>
                </div>
              ) : scheduleResult ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300">
                    {scheduleResult.analysis}
                  </div>

                  {scheduleResult.suggestions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No pending tasks need rescheduling right now. Your schedule is well balanced!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {scheduleResult.suggestions.map((sug) => (
                        <div
                          key={sug.taskId}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{sug.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sug.reason}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                              <span>
                                Suggested:{' '}
                                <strong className="text-slate-700 dark:text-slate-300">
                                  {new Date(sug.suggestedDueDate).toLocaleDateString([], {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </strong>
                              </span>
                              <span>Est: {sug.estimatedDuration} mins</span>
                            </div>
                          </div>

                          <button
                            onClick={async () => {
                              try {
                                await api.patch(`/tasks/${sug.taskId}`, {
                                  dueDate: sug.suggestedDueDate,
                                });
                                setScheduleResult((prev) => ({
                                  ...prev,
                                  suggestions: prev.suggestions.filter((s) => s.taskId !== sug.taskId),
                                }));
                                setMessage(`Updated "${sug.title}" to optimized schedule!`);
                              } catch (err) {
                                //
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-primary text-white font-semibold text-[11px] shrink-0 hover:bg-primary-hover shadow-sm"
                          >
                            Apply Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: PRODUCTIVITY INSIGHTS */}
          {tab === 'suggestions' && (
            <div className="space-y-4">
              {loadingSuggestions ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Generating personalized productivity insights...</p>
                </div>
              ) : suggestions ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {suggestions.suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5"
                    >
                      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
