import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Laptop,
  User,
  Flame,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import RescheduleModal from '../components/RescheduleModal.jsx';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTaskModal, setActiveTaskModal] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [rescheduleTask, setRescheduleTask] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dashRes, weekRes, catRes, goalRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/weekly'),
        api.get('/users/categories'),
        api.get('/goals'),
      ]);

      if (dashRes.data?.success) setAnalytics(dashRes.data.data);
      if (weekRes.data?.success) setWeeklyData(weekRes.data.data.chartData);
      if (catRes.data?.success) setCategories(catRes.data.data);
      if (goalRes.data?.success) setGoals(goalRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Listen to global task updates
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('task-updated', handleUpdate);
    return () => window.removeEventListener('task-updated', handleUpdate);
  }, [fetchDashboardData]);

  const handleToggleTask = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      if (res.data?.success) {
        if (res.data.data.status === 'COMPLETED') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const metrics = analytics?.metrics || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    todayTotalTasks: 0,
    todayCompletedTasks: 0,
    todayCompletionRate: 0,
    todayFocusMinutes: 0,
    activeGoalsCount: 0,
    averageGoalProgress: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Welcome Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Achiever'}! 👋
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {user?.userType || 'Personal'} Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{todayDateString}</span>
            <span>•</span>
            <span>
              {metrics.todayCompletedTasks} of {metrics.todayTotalTasks} tasks completed today ({metrics.todayCompletionRate}%)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedTaskForEdit(null);
              setActiveTaskModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Tasks"
          value={metrics.totalTasks}
          subtitle="All recorded tasks"
          icon={CheckSquare}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={metrics.completedTasks}
          subtitle={`${metrics.completionRate}% completion rate`}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgressTasks}
          subtitle="Active items"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={metrics.pendingTasks}
          subtitle="Upcoming to-dos"
          icon={TrendingUp}
          color="warning"
        />
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            title="Overdue"
            value={metrics.overdueTasks}
            subtitle={metrics.overdueTasks > 0 ? 'Requires attention' : 'All on track!'}
            icon={AlertCircle}
            color={metrics.overdueTasks > 0 ? 'danger' : 'success'}
          />
        </div>
      </div>

      {/* 3. Personalized Profile Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-primary/5 to-transparent border border-primary/20 dark:border-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/30">
              {user?.userType === 'student' && <GraduationCap className="w-5 h-5" />}
              {user?.userType === 'professional' && <Briefcase className="w-5 h-5" />}
              {user?.userType === 'freelancer' && <Laptop className="w-5 h-5" />}
              {(!user?.userType || user?.userType === 'personal') && <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {user?.userType === 'student' && 'Student Academic Hub'}
                {user?.userType === 'professional' && 'Professional Work Management'}
                {user?.userType === 'freelancer' && 'Freelancer Client Tracker'}
                {(!user?.userType || user?.userType === 'personal') && 'Personal Productivity Center'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.userType === 'student' && 'Course assignments, subject revision, and exam countdown schedules.'}
                {user?.userType === 'professional' && 'Sprint deliverables, high-priority work items, and milestone tracking.'}
                {user?.userType === 'freelancer' && 'Client deliverables, invoicing tasks, and deadline progress.'}
                {(!user?.userType || user?.userType === 'personal') && 'Daily routine, habit streaks, fitness goals, and home reminders.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/my-day"
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-card-darkBg border border-slate-200 dark:border-card-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Open My Day</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Grid: Today's Tasks & Weekly Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Today's Schedule
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {analytics?.todayTasks?.length || 0}
              </span>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Tasks <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Today Tasks List */}
          <div className="bg-white dark:bg-card-darkBg rounded-3xl border border-slate-200/80 dark:border-card-darkBorder shadow-card divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {!analytics?.todayTasks || analytics.todayTasks.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No tasks scheduled for today!
                </p>
                <p className="text-xs text-slate-400">
                  Take a moment to plan your day or launch a focus timer session.
                </p>
                <button
                  onClick={() => {
                    setSelectedTaskForEdit(null);
                    setActiveTaskModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
                >
                  Schedule a Task
                </button>
              </div>
            ) : (
              analytics.todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 sm:p-4.5 flex items-start gap-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        onClick={() => {
                          setSelectedTaskForEdit(task);
                          setActiveTaskModal(true);
                        }}
                        className={`text-sm font-bold truncate cursor-pointer hover:text-primary transition-colors ${
                          task.status === 'COMPLETED'
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </p>
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      {task.dueTime && (
                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
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
                </div>
              ))
            )}
          </div>

          {/* Overdue Alert Banner (If Any) */}
          {metrics.overdueTasks > 0 && (
            <div className="p-4 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  You have <strong className="font-bold">{metrics.overdueTasks} overdue tasks</strong> waiting for attention.
                </p>
              </div>
              <Link
                to="/tasks?status=OVERDUE"
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-colors"
              >
                Resolve Overdue
              </Link>
            </div>
          )}
        </div>

        {/* Right Col: Weekly Chart & Goals */}
        <div className="space-y-6">
          {/* Weekly Productivity Bar Chart */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Weekly Output
              </h3>
              <Link to="/analytics" className="text-xs font-semibold text-primary hover:underline">
                Reports
              </Link>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="completed" fill="#6C4DE6" radius={[6, 6, 0, 0]} name="Completed" />
                  <Bar dataKey="created" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Created" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Goals Progress Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-600" />
                Goals Progress
              </h3>
              <Link to="/goals" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active goals yet.</p>
              ) : (
                goals.slice(0, 3).map((g) => (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {g.title}
                      </span>
                      <span className="font-extrabold text-primary">{Math.round(g.progressPercentage)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${g.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={activeTaskModal}
        onClose={() => {
          setActiveTaskModal(false);
          setSelectedTaskForEdit(null);
        }}
        task={selectedTaskForEdit}
        onSaved={() => fetchDashboardData()}
        categories={categories}
        goals={goals}
      />

      {/* Reschedule Modal */}
      {rescheduleTask && (
        <RescheduleModal
          isOpen={!!rescheduleTask}
          task={rescheduleTask}
          onClose={() => setRescheduleTask(null)}
          onRescheduled={() => fetchDashboardData()}
        />
      )}
    </div>
  );
}
