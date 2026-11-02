import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import api from '../services/api.js';
import StatCard from '../components/StatCard.jsx';

export default function AnalyticsPage() {
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [dashRes, weekRes, monthRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/weekly'),
        api.get('/analytics/monthly'),
      ]);

      if (dashRes.data?.success) setDashboardMetrics(dashRes.data.data);
      if (weekRes.data?.success) setWeeklyData(weekRes.data.data.chartData);
      if (monthRes.data?.success) setMonthlyData(monthRes.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const COLORS = ['#6C4DE6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const metrics = dashboardMetrics?.metrics || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    todayFocusMinutes: 0,
  };

  const categoryData =
    monthlyData?.categoryDistribution?.filter((c) => c.total > 0) ||
    dashboardMetrics?.categoryBreakdown?.map((c) => ({
      category: c.name,
      total: c.taskCount,
      color: c.color,
    })) ||
    [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Productivity Analytics
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
            Recharts Engine
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evidence-based productivity metrics calculated directly from your real database history.
        </p>
      </div>

      {/* 2. Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Completion"
          value={`${metrics.completionRate}%`}
          subtitle={`${metrics.completedTasks} of ${metrics.totalTasks} tasks`}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Total Tasks Done"
          value={metrics.completedTasks}
          subtitle="Closed out items"
          icon={BarChart3}
          color="primary"
        />
        <StatCard
          title="Focus Logged"
          value={`${metrics.todayFocusMinutes}m`}
          subtitle="Minutes of deep work today"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Goal Execution"
          value={`${metrics.averageGoalProgress || 0}%`}
          subtitle="Average progress across goals"
          icon={Award}
          color="warning"
        />
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Output Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                7-Day Task Output (Created vs Completed)
              </h3>
              <p className="text-xs text-slate-400">Daily velocity over the past week</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="completed" fill="#6C4DE6" radius={[6, 6, 0, 0]} name="Completed" />
                <Bar dataKey="created" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Created" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Minutes Line Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Daily Focus Time (Minutes)
              </h3>
              <p className="text-xs text-slate-400">Pomodoro focus minutes per day</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="focusMinutes"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8B5CF6' }}
                  activeDot={{ r: 6 }}
                  name="Focus Minutes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Category Breakdown Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-primary" />
          Category-Wise Task Distribution
        </h3>

        {categoryData.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No category data recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}
                    />
                    <span>{cat.category}</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.total} tasks</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
