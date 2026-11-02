import prisma from '../config/database.js';

export const SYSTEM_ACHIEVEMENTS = [
  {
    code: 'FIRST_TASK',
    title: 'First Step Forward',
    description: 'Complete your first task on My Task.',
    icon: 'check-circle',
    category: 'TASK',
    badgeLevel: 'BRONZE',
    points: 10,
    requirementCount: 1,
  },
  {
    code: 'TASK_MASTER_10',
    title: 'Productive Momentum',
    description: 'Complete 10 tasks successfully.',
    icon: 'zap',
    category: 'TASK',
    badgeLevel: 'SILVER',
    points: 25,
    requirementCount: 10,
  },
  {
    code: 'TASK_CENTURION',
    title: 'Master of Execution',
    description: 'Complete 50 tasks across your projects.',
    icon: 'award',
    category: 'TASK',
    badgeLevel: 'GOLD',
    points: 100,
    requirementCount: 50,
  },
  {
    code: 'GOAL_SETTER',
    title: 'Visionary',
    description: 'Create your first long-term goal.',
    icon: 'target',
    category: 'GOAL',
    badgeLevel: 'BRONZE',
    points: 15,
    requirementCount: 1,
  },
  {
    code: 'MILESTONE_CRUSHER',
    title: 'Milestone Conqueror',
    description: 'Reach and complete your first goal milestone.',
    icon: 'flag',
    category: 'GOAL',
    badgeLevel: 'SILVER',
    points: 30,
    requirementCount: 1,
  },
  {
    code: 'GOAL_ACHIEVER',
    title: 'Goal Champion',
    description: 'Reach 100% completion on a long-term goal.',
    icon: 'trophy',
    category: 'GOAL',
    badgeLevel: 'GOLD',
    points: 150,
    requirementCount: 1,
  },
  {
    code: 'FOCUS_INITIATE',
    title: 'Deep Work Initiate',
    description: 'Complete your first Pomodoro focus session.',
    icon: 'clock',
    category: 'FOCUS',
    badgeLevel: 'BRONZE',
    points: 15,
    requirementCount: 1,
  },
  {
    code: 'FOCUS_CHAMPION',
    title: 'Focus Champion',
    description: 'Complete 10 focused work sessions without interruptions.',
    icon: 'shield',
    category: 'FOCUS',
    badgeLevel: 'SILVER',
    points: 50,
    requirementCount: 10,
  },
];

export const getAchievements = async (userId) => {
  // Ensure default achievements exist in DB
  for (const ach of SYSTEM_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      create: ach,
      update: {
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        badgeLevel: ach.badgeLevel,
        points: ach.points,
        requirementCount: ach.requirementCount,
      },
    }).catch(() => {});
  }

  const allAchievements = await prisma.achievement.findMany({
    orderBy: { points: 'asc' },
  });

  const userUnlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, unlockedAt: true },
  });

  const unlockedMap = new Map();
  userUnlocked.forEach((u) => unlockedMap.set(u.achievementId, u.unlockedAt));

  return allAchievements.map((ach) => ({
    ...ach,
    isUnlocked: unlockedMap.has(ach.id),
    unlockedAt: unlockedMap.get(ach.id) || null,
  }));
};

export const checkAndAwardAchievements = async (userId) => {
  try {
    const [completedTasksCount, createdGoalsCount, completedGoalsCount, milestonesCount, focusCount] =
      await Promise.all([
        prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.goal.count({ where: { userId } }),
        prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.goalMilestone.count({ where: { goal: { userId }, isCompleted: true } }),
        prisma.focusSession.count({ where: { userId, type: 'WORK', completed: true } }),
      ]);

    const conditions = {
      FIRST_TASK: completedTasksCount >= 1,
      TASK_MASTER_10: completedTasksCount >= 10,
      TASK_CENTURION: completedTasksCount >= 50,
      GOAL_SETTER: createdGoalsCount >= 1,
      MILESTONE_CRUSHER: milestonesCount >= 1,
      GOAL_ACHIEVER: completedGoalsCount >= 1,
      FOCUS_INITIATE: focusCount >= 1,
      FOCUS_CHAMPION: focusCount >= 10,
    };

    const achievements = await prisma.achievement.findMany();
    const existingUnlocked = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedSet = new Set(existingUnlocked.map((u) => u.achievementId));

    for (const ach of achievements) {
      if (!unlockedSet.has(ach.id) && conditions[ach.code]) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
        });

        // Notify user about newly unlocked achievement
        await prisma.notification.create({
          data: {
            userId,
            title: `Achievement Unlocked: ${ach.title}! 🏆`,
            message: `You earned the "${ach.title}" badge: ${ach.description} (+${ach.points} pts)`,
            type: 'ACHIEVEMENT',
          },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Error checking achievements:', err);
  }
};
