import prisma from '../config/database.js';
import { checkAndAwardAchievements } from './achievementService.js';

export const getFocusSessions = async (userId, limit = 20) => {
  const sessions = await prisma.focusSession.findMany({
    where: { userId },
    include: {
      task: {
        select: { id: true, title: true, priority: true },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });

  const totalWorkMinutes = await prisma.focusSession.aggregate({
    where: { userId, type: 'WORK', completed: true },
    _sum: { durationMinutes: true },
  });

  const totalSessionsCount = await prisma.focusSession.count({
    where: { userId, completed: true },
  });

  return {
    sessions,
    totalWorkMinutes: totalWorkMinutes._sum.durationMinutes || 0,
    totalSessionsCount,
  };
};

export const createFocusSession = async (userId, data) => {
  const { taskId, durationMinutes, type = 'WORK', completed = true, startedAt, endedAt } = data;

  const session = await prisma.focusSession.create({
    data: {
      userId,
      taskId: taskId || null,
      durationMinutes: parseInt(durationMinutes, 10),
      type,
      completed: Boolean(completed),
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : new Date(),
    },
    include: {
      task: {
        select: { id: true, title: true },
      },
    },
  });

  // Check achievements (e.g. Focus Champion)
  await checkAndAwardAchievements(userId);

  return session;
};
