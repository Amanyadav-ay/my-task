import prisma from '../config/database.js';
import { getNextRecurrenceDate, calculateGoalProgress } from '../utils/helpers.js';
import { checkAndAwardAchievements } from './achievementService.js';
import { createInAppNotification } from './notificationService.js';

export const getTasks = async (userId, filters = {}) => {
  const { status, priority, categoryId, goalId, search, dueDate, startDate, endDate, isToday } = filters;

  const where = { userId };

  if (status) {
    if (status === 'ACTIVE') {
      where.status = { in: ['PENDING', 'IN_PROGRESS'] };
    } else {
      where.status = status;
    }
  }

  if (priority) {
    where.priority = priority;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (goalId) {
    where.goalId = goalId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isToday) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    where.dueDate = {
      gte: todayStart,
      lte: todayEnd,
    };
  } else if (startDate || endDate) {
    where.dueDate = {};
    if (startDate) where.dueDate.gte = new Date(startDate);
    if (endDate) where.dueDate.lte = new Date(endDate);
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      category: true,
      subtasks: { orderBy: { sortOrder: 'asc' } },
      recurrence: true,
      goal: { select: { id: true, title: true, progressPercentage: true } },
      attachments: true,
    },
    orderBy: [
      { dueDate: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Dynamically update status to OVERDUE if pending and past dueDate
  const now = new Date();
  const tasksWithUpdatedStatus = tasks.map((task) => {
    if (task.status === 'PENDING' && task.dueDate && new Date(task.dueDate) < now) {
      task.status = 'OVERDUE';
    }
    return task;
  });

  return tasksWithUpdatedStatus;
};

export const getTaskById = async (userId, taskId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      category: true,
      subtasks: { orderBy: { sortOrder: 'asc' } },
      recurrence: true,
      goal: true,
      attachments: true,
      calendarEvents: true,
      focusSessions: { orderBy: { startedAt: 'desc' }, take: 5 },
    },
  });

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  return task;
};

export const createTask = async (userId, data) => {
  const {
    title,
    description,
    categoryId,
    priority = 'MEDIUM',
    status = 'PENDING',
    startDate,
    dueDate,
    dueTime,
    reminderTime,
    estimatedDuration,
    notes,
    goalId,
    subtasks = [],
    recurrence,
  } = data;

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      description,
      categoryId: categoryId || null,
      priority,
      status,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime || null,
      reminderTime: reminderTime ? new Date(reminderTime) : null,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
      notes: notes || null,
      goalId: goalId || null,
      subtasks: subtasks && subtasks.length > 0 ? {
        create: subtasks.map((st, index) => ({
          title: typeof st === 'string' ? st : st.title,
          isCompleted: false,
          sortOrder: index,
        })),
      } : undefined,
      recurrence: recurrence && recurrence.frequency && recurrence.frequency !== 'NEVER' ? {
        create: {
          frequency: recurrence.frequency,
          interval: recurrence.interval || 1,
          daysOfWeek: recurrence.daysOfWeek ? JSON.stringify(recurrence.daysOfWeek) : null,
          endDate: recurrence.endDate ? new Date(recurrence.endDate) : null,
          count: recurrence.count ? parseInt(recurrence.count, 10) : null,
        },
      } : undefined,
    },
    include: {
      category: true,
      subtasks: true,
      recurrence: true,
      goal: true,
    },
  });

  // Automatically create a calendar event if dueDate exists
  if (task.dueDate) {
    const eventStart = new Date(task.dueDate);
    const eventEnd = new Date(eventStart.getTime() + (task.estimatedDuration || 60) * 60000);
    const color = task.priority === 'HIGH' ? '#EF4444' : task.priority === 'LOW' ? '#10B981' : '#6C4DE6';

    await prisma.calendarEvent.create({
      data: {
        userId,
        taskId: task.id,
        title: task.title,
        description: task.description || null,
        start: eventStart,
        end: eventEnd,
        allDay: !dueTime,
        color,
      },
    }).catch(() => {});
  }

  // If goal is linked, recalculate goal progress
  if (task.goalId) {
    await updateGoalProgressOnTaskChange(task.goalId);
  }

  // Check achievements (e.g. task creation milestones)
  await checkAndAwardAchievements(userId);

  return task;
};

export const updateTask = async (userId, taskId, data) => {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { recurrence: true, goal: true },
  });

  if (!existing) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const {
    title,
    description,
    categoryId,
    priority,
    status,
    startDate,
    dueDate,
    dueTime,
    reminderTime,
    estimatedDuration,
    notes,
    goalId,
    progressPercentage,
    subtasks,
  } = data;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (categoryId !== undefined) updateData.categoryId = categoryId || null;
  if (priority !== undefined) updateData.priority = priority;
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (dueTime !== undefined) updateData.dueTime = dueTime || null;
  if (reminderTime !== undefined) updateData.reminderTime = reminderTime ? new Date(reminderTime) : null;
  if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration ? parseInt(estimatedDuration, 10) : null;
  if (notes !== undefined) updateData.notes = notes;
  if (goalId !== undefined) updateData.goalId = goalId || null;
  if (progressPercentage !== undefined) updateData.progressPercentage = parseInt(progressPercentage, 10);

  if (status !== undefined) {
    updateData.status = status;
    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.progressPercentage = 100;
    } else if (status !== 'COMPLETED' && existing.status === 'COMPLETED') {
      updateData.completedAt = null;
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      category: true,
      subtasks: { orderBy: { sortOrder: 'asc' } },
      recurrence: true,
      goal: true,
      attachments: true,
    },
  });

  // Sync calendar event if dates changed
  if (dueDate !== undefined || title !== undefined || priority !== undefined) {
    const targetDueDate = updatedTask.dueDate;
    if (targetDueDate) {
      const start = new Date(targetDueDate);
      const end = new Date(start.getTime() + (updatedTask.estimatedDuration || 60) * 60000);
      const color = updatedTask.priority === 'HIGH' ? '#EF4444' : updatedTask.priority === 'LOW' ? '#10B981' : '#6C4DE6';

      await prisma.calendarEvent.upsert({
        where: { id: (await prisma.calendarEvent.findFirst({ where: { taskId } }))?.id || 'non-existent' },
        create: {
          userId,
          taskId: updatedTask.id,
          title: updatedTask.title,
          start,
          end,
          allDay: !updatedTask.dueTime,
          color,
        },
        update: {
          title: updatedTask.title,
          start,
          end,
          color,
        },
      }).catch(() => {});
    }
  }

  // Handle goal progress sync
  if (existing.goalId) await updateGoalProgressOnTaskChange(existing.goalId);
  if (updatedTask.goalId && updatedTask.goalId !== existing.goalId) {
    await updateGoalProgressOnTaskChange(updatedTask.goalId);
  }

  return updatedTask;
};

export const toggleTaskComplete = async (userId, taskId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { recurrence: true, subtasks: true },
  });

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const isNowCompleted = task.status !== 'COMPLETED';
  const newStatus = isNowCompleted ? 'COMPLETED' : 'PENDING';
  const completedAt = isNowCompleted ? new Date() : null;
  const progressPercentage = isNowCompleted ? 100 : 0;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      completedAt,
      progressPercentage,
      // Also mark subtasks complete if completing task
      subtasks: isNowCompleted ? {
        updateMany: {
          where: { taskId },
          data: { isCompleted: true },
        },
      } : undefined,
    },
    include: {
      category: true,
      subtasks: true,
      recurrence: true,
      goal: true,
    },
  });

  if (isNowCompleted) {
    // Notification on task completion
    await createInAppNotification({
      userId,
      title: 'Task Completed! 🎉',
      message: `Congratulations! You successfully completed "${task.title}".`,
      type: 'COMPLETION',
      taskId: task.id,
    });

    // Check achievements
    await checkAndAwardAchievements(userId);

    // If recurring, generate next occurrence!
    if (task.recurrence && task.recurrence.frequency !== 'NEVER') {
      await generateNextRecurringTask(userId, task);
    }
  }

  // If goal is linked, update its progress
  if (task.goalId) {
    await updateGoalProgressOnTaskChange(task.goalId);
  }

  return updated;
};

export const deleteTask = async (userId, taskId) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  if (task.goalId) {
    await updateGoalProgressOnTaskChange(task.goalId);
  }

  return true;
};

export const generateNextRecurringTask = async (userId, completedTask) => {
  const recurrence = completedTask.recurrence;
  if (!recurrence) return;

  const nextDueDate = getNextRecurrenceDate(completedTask.dueDate, recurrence.frequency, recurrence.interval);

  // Check end date or count limit
  if (recurrence.endDate && nextDueDate > new Date(recurrence.endDate)) {
    return;
  }
  if (recurrence.count && recurrence.occurrencesCreated >= recurrence.count) {
    return;
  }

  // Create next task
  const nextTask = await prisma.task.create({
    data: {
      userId,
      title: completedTask.title,
      description: completedTask.description,
      categoryId: completedTask.categoryId,
      priority: completedTask.priority,
      status: 'PENDING',
      startDate: new Date(),
      dueDate: nextDueDate,
      dueTime: completedTask.dueTime,
      estimatedDuration: completedTask.estimatedDuration,
      goalId: completedTask.goalId,
      subtasks: completedTask.subtasks && completedTask.subtasks.length > 0 ? {
        create: completedTask.subtasks.map((st, i) => ({
          title: st.title,
          isCompleted: false,
          sortOrder: i,
        })),
      } : undefined,
    },
  });

  // Update recurrence count
  await prisma.taskRecurrence.update({
    where: { id: recurrence.id },
    data: { occurrencesCreated: { increment: 1 } },
  });

  return nextTask;
};

export const updateGoalProgressOnTaskChange = async (goalId) => {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { milestones: true, tasks: true },
    });
    if (!goal) return;

    const progress = calculateGoalProgress(goal.milestones, goal.tasks);
    const newStatus = progress === 100 ? 'COMPLETED' : goal.status;

    await prisma.goal.update({
      where: { id: goalId },
      data: {
        progressPercentage: progress,
        status: newStatus,
      },
    });
  } catch (err) {
    console.error('Error updating goal progress:', err);
  }
};
