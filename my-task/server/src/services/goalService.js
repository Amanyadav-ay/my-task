import prisma from '../config/database.js';
import { calculateGoalProgress } from '../utils/helpers.js';
import { checkAndAwardAchievements } from './achievementService.js';
import { createInAppNotification } from './notificationService.js';

export const getGoals = async (userId, filters = {}) => {
  const { status, category } = filters;
  const where = { userId };

  if (status) where.status = status;
  if (category) where.category = category;

  const goals = await prisma.goal.findMany({
    where,
    include: {
      milestones: { orderBy: { sortOrder: 'asc' } },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return goals;
};

export const getGoalById = async (userId, goalId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: {
      milestones: { orderBy: { sortOrder: 'asc' } },
      tasks: {
        include: { category: true },
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!goal) {
    const error = new Error('Goal not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  return goal;
};

export const createGoal = async (userId, data) => {
  const { title, description, category, startDate, targetDate, milestones = [] } = data;

  const goal = await prisma.goal.create({
    data: {
      userId,
      title,
      description,
      category,
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
      status: 'IN_PROGRESS',
      progressPercentage: 0,
      milestones: milestones && milestones.length > 0 ? {
        create: milestones.map((m, index) => ({
          title: typeof m === 'string' ? m : m.title,
          isCompleted: false,
          dueDate: m.dueDate ? new Date(m.dueDate) : null,
          sortOrder: index,
        })),
      } : undefined,
    },
    include: {
      milestones: true,
      tasks: true,
    },
  });

  await checkAndAwardAchievements(userId);

  return goal;
};

export const updateGoal = async (userId, goalId, data) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: { milestones: true, tasks: true },
  });

  if (!goal) {
    const error = new Error('Goal not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const { title, description, category, status, targetDate } = data;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (status !== undefined) updateData.status = status;
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: updateData,
    include: {
      milestones: { orderBy: { sortOrder: 'asc' } },
      tasks: true,
    },
  });

  return updated;
};

export const toggleMilestone = async (userId, goalId, milestoneId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: { milestones: true, tasks: true },
  });

  if (!goal) {
    const error = new Error('Goal not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const milestone = goal.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    const error = new Error('Milestone not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const updatedMilestone = await prisma.goalMilestone.update({
    where: { id: milestoneId },
    data: { isCompleted: !milestone.isCompleted },
  });

  // Re-fetch all milestones to accurately calculate progress
  const refreshedMilestones = await prisma.goalMilestone.findMany({
    where: { goalId },
  });

  const progress = calculateGoalProgress(refreshedMilestones, goal.tasks);
  const newStatus = progress === 100 ? 'COMPLETED' : goal.status;

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      progressPercentage: progress,
      status: newStatus,
    },
    include: {
      milestones: { orderBy: { sortOrder: 'asc' } },
      tasks: true,
    },
  });

  if (updatedMilestone.isCompleted) {
    await createInAppNotification({
      userId,
      title: 'Milestone Achieved! 🎯',
      message: `You completed the milestone "${milestone.title}" for goal "${goal.title}".`,
      type: 'ACHIEVEMENT',
    });
    await checkAndAwardAchievements(userId);
  }

  return updatedGoal;
};

export const deleteGoal = async (userId, goalId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    const error = new Error('Goal not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  await prisma.goal.delete({
    where: { id: goalId },
  });

  return true;
};
