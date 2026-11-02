import prisma from '../config/database.js';
import { getStartOfWeek, getEndOfWeek } from '../utils/helpers.js';

export const generateWeeklyReport = async (userId, customDate = new Date()) => {
  const weekStart = getStartOfWeek(customDate);
  const weekEnd = getEndOfWeek(customDate);

  const [createdCount, completedCount, pendingCount, overdueCount, focusSessions, goals] =
    await Promise.all([
      prisma.task.count({
        where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.task.count({
        where: { userId, status: 'COMPLETED', completedAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.task.count({
        where: { userId, status: 'PENDING' },
      }),
      prisma.task.count({
        where: { userId, status: { in: ['PENDING', 'IN_PROGRESS'] }, dueDate: { lt: new Date() } },
      }),
      prisma.focusSession.findMany({
        where: { userId, startedAt: { gte: weekStart, lte: weekEnd }, type: 'WORK', completed: true },
        select: { durationMinutes: true },
      }),
      prisma.goal.findMany({
        where: { userId },
        select: { progressPercentage: true },
      }),
    ]);

  const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, curr) => acc + curr.progressPercentage, 0) / goals.length)
    : 0;

  let summaryNotes = `This week you completed ${completedCount} tasks and logged ${totalFocusMinutes} minutes of focus time.`;
  if (completedCount >= 10) {
    summaryNotes += ' Excellent pace! You maintained high momentum across your goals.';
  } else if (overdueCount > 3) {
    summaryNotes += ` You have ${overdueCount} overdue tasks. Consider using Smart Reschedule to balance your load.`;
  } else {
    summaryNotes += ' Steady progress! Keep planning ahead to achieve your targets.';
  }

  const report = await prisma.weeklyReport.create({
    data: {
      userId,
      weekStart,
      weekEnd,
      tasksCreated: createdCount,
      tasksCompleted: completedCount,
      tasksPending: pendingCount,
      tasksOverdue: overdueCount,
      focusTimeMinutes: totalFocusMinutes,
      goalProgressAverage: avgGoalProgress,
      summaryNotes,
    },
  });

  return report;
};

export const getWeeklyReports = async (userId) => {
  const reports = await prisma.weeklyReport.findMany({
    where: { userId },
    orderBy: { weekStart: 'desc' },
    take: 12,
  });

  return reports;
};
