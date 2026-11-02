import prisma from '../config/database.js';
import { getStartOfWeek, getEndOfWeek } from '../utils/helpers.js';

export const getDashboardAnalytics = async (userId) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Run database aggregations in parallel for high performance
  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    todayTasks,
    todayCompletedTasks,
    upcomingTasks,
    goals,
    focusSessions,
    categories,
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.task.count({ where: { userId, status: 'PENDING' } }),
    prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
    prisma.task.count({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
    }),
    prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: todayStart, lte: todayEnd },
      },
      include: { category: true, subtasks: true },
      orderBy: { priority: 'desc' },
    }),
    prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        dueDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now },
      },
      take: 5,
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.goal.findMany({
      where: { userId, status: { in: ['IN_PROGRESS', 'COMPLETED'] } },
      select: { id: true, title: true, progressPercentage: true, status: true, targetDate: true },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: todayStart },
      },
      select: { durationMinutes: true, type: true },
    }),
    prisma.taskCategory.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    }),
  ]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const todayCompletionRate = todayTasks.length > 0 ? Math.round((todayCompletedTasks / todayTasks.length) * 100) : 0;
  const todayFocusMinutes = focusSessions.reduce((acc, curr) => acc + (curr.type === 'WORK' ? curr.durationMinutes : 0), 0);

  const averageGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, curr) => acc + curr.progressPercentage, 0) / goals.length)
    : 0;

  return {
    metrics: {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      todayTotalTasks: todayTasks.length,
      todayCompletedTasks,
      todayCompletionRate,
      todayFocusMinutes,
      activeGoalsCount: goals.length,
      averageGoalProgress,
    },
    todayTasks,
    upcomingDeadlines: upcomingTasks,
    goalsSummary: goals,
    categoryBreakdown: categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      taskCount: c._count.tasks,
    })),
  };
};

export const getWeeklyProductivity = async (userId) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  // Fetch completed tasks and created tasks in the 7-day window
  const [completedTasks, createdTasks, focusSessions] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: start, lte: end },
      },
      select: { id: true, completedAt: true, priority: true },
    }),
    prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      select: { id: true, createdAt: true },
    }),
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end },
      },
      select: { durationMinutes: true, type: true, startedAt: true },
    }),
  ]);

  // Aggregate by day of the week
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyData = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dayKey = days[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    const completedOnDay = completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      return new Date(t.completedAt).toISOString().split('T')[0] === dateStr;
    }).length;

    const createdOnDay = createdTasks.filter((t) => {
      return new Date(t.createdAt).toISOString().split('T')[0] === dateStr;
    }).length;

    const focusMinutesOnDay = focusSessions
      .filter((s) => s.type === 'WORK' && new Date(s.startedAt).toISOString().split('T')[0] === dateStr)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    dailyData.push({
      day: dayKey,
      date: dateStr,
      completed: completedOnDay,
      created: createdOnDay,
      focusMinutes: focusMinutesOnDay,
    });
  }

  return {
    dateRange: { start: start.toISOString(), end: end.toISOString() },
    chartData: dailyData,
    totalCompletedThisWeek: completedTasks.length,
    totalCreatedThisWeek: createdTasks.length,
    totalFocusMinutesThisWeek: focusSessions.reduce((acc, curr) => acc + (curr.type === 'WORK' ? curr.durationMinutes : 0), 0),
  };
};

export const getMonthlyProductivity = async (userId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const [completedTasks, createdTasks, categoryStats, priorityStats] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true },
    }),
    prisma.task.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.taskCategory.findMany({
      where: { userId },
      include: {
        tasks: {
          where: {
            OR: [
              { completedAt: { gte: startOfMonth, lte: endOfMonth } },
              { createdAt: { gte: startOfMonth, lte: endOfMonth } },
            ],
          },
          select: { status: true },
        },
      },
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { userId, status: 'COMPLETED', completedAt: { gte: startOfMonth, lte: endOfMonth } },
      _count: { id: true },
    }),
  ]);

  return {
    month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
    totalCompleted: completedTasks.length,
    totalCreated: createdTasks,
    categoryDistribution: categoryStats.map((cat) => ({
      category: cat.name,
      color: cat.color,
      completed: cat.tasks.filter((t) => t.status === 'COMPLETED').length,
      total: cat.tasks.length,
    })),
    priorityDistribution: priorityStats.map((p) => ({
      priority: p.priority,
      count: p._count.id,
    })),
  };
};
