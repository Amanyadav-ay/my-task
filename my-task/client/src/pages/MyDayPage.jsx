import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SunMedium,
  CheckSquare,
  Clock,
  Plus,
  Play,
  Calendar,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api.js';
import TaskModal from '../components/TaskModal.jsx';
import RescheduleModal from '../components/RescheduleModal.jsx';
import confetti from 'canvas-confetti';

export default function MyDayPage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rescheduleTask, setRescheduleTask] = useState(null);

  const navigate = useNavigate();

  const fetchMyDayTasks = useCallback(async () => {
    try {
      const [taskRes, catRes, goalRes] = await Promise.all([
        api.get('/tasks?isToday=true'),
        api.get('/users/categories'),
        api.get('/goals'),
      ]);

      if (taskRes.data?.success) setTasks(taskRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (goalRes.data?.success) setGoals(goalRes.data.data);
    } catch (err) {
      console.error('Error fetching My Day:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDayTasks();
  }, [fetchMyDayTasks]);

  const handleToggleComplete = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      if (res.data?.success) {
        if (res.data.data.status === 'COMPLETED') {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
        fetchMyDayTasks();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header Card with Sunset Gradient */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-tr from-primary via-purple-600 to-indigo-600 text-white shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <SunMedium className="w-48 h-48" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <SunMedium className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Focus & Execute
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">My Day</h1>
            <p className="text-sm text-purple-100 mt-1 font-medium">{todayFormatted}</p>
          </div>

          {/* Daily Progress Bar */}
          <div className="pt-2 space-y-1.5 max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Today's Progress</span>
              <span>
                {completedCount} of {totalCount} completed ({percentage}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Add Bar */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Scheduled Tasks</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
            {totalCount}
          </span>
        </h2>

        <button
          onClick={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task to My Day</span>
        </button>
      </div>

      {/* 3. Task List */}
      <div className="bg-white dark:bg-card-darkBg rounded-3xl border border-slate-200/80 dark:border-card-darkBorder shadow-card divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <SunMedium className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              Clear Schedule for Today
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Plan your priorities for the day, or start a deep-focus Pomodoro session.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover"
              >
                Add First Task
              </button>
              <button
                onClick={() => navigate('/focus')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
              >
                Start Focus Session
              </button>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <input
                type="checkbox"
                checked={task.status === 'COMPLETED'}
                onChange={() => handleToggleComplete(task.id)}
                className="mt-1 rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className={`text-sm sm:text-base font-bold truncate cursor-pointer hover:text-primary transition-colors ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h4>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'HIGH'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : task.priority === 'LOW'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-400">
                  {task.dueTime && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {task.dueTime}
                    </span>
                  )}
                  {task.category && (
                    <span
                      className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
                      style={{
                        backgroundColor: `${task.category.color}15`,
                        color: task.category.color,
                      }}
                    >
                      {task.category.name}
                    </span>
                  )}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span>
                      {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons on hover */}
              <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigate(`/focus?taskId=${task.id}`)}
                  className="p-2 rounded-xl text-primary hover:bg-primary/10"
                  title="Launch Pomodoro Focus Session for this task"
                >
                  <Play className="w-4 h-4 fill-primary" />
                </button>
                <button
                  onClick={() => setRescheduleTask(task)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Reschedule task"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSaved={() => fetchMyDayTasks()}
        categories={categories}
        goals={goals}
      />

      {/* Reschedule Modal */}
      {rescheduleTask && (
        <RescheduleModal
          isOpen={!!rescheduleTask}
          task={rescheduleTask}
          onClose={() => setRescheduleTask(null)}
          onRescheduled={() => fetchMyDayTasks()}
        />
      )}
    </div>
  );
}
