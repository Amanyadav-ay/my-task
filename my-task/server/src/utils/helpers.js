/**
 * Helper utilities for MY TASK
 */

export const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

export const calculateGoalProgress = (milestones = [], tasks = []) => {
  let milestoneScore = 0;
  let taskScore = 0;
  const hasMilestones = milestones && milestones.length > 0;
  const hasTasks = tasks && tasks.length > 0;

  if (!hasMilestones && !hasTasks) return 0;

  if (hasMilestones) {
    const completedMilestones = milestones.filter((m) => m.isCompleted).length;
    milestoneScore = (completedMilestones / milestones.length) * 100;
  }

  if (hasTasks) {
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    taskScore = (completedTasks / tasks.length) * 100;
  }

  if (hasMilestones && hasTasks) {
    // 60% weight to milestones, 40% weight to tasks
    return Math.round(milestoneScore * 0.6 + taskScore * 0.4);
  }

  return Math.round(hasMilestones ? milestoneScore : taskScore);
};

export const getNextRecurrenceDate = (baseDate, frequency, interval = 1) => {
  const date = new Date(baseDate || new Date());
  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + interval);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7 * interval);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + interval);
      break;
    default:
      date.setDate(date.getDate() + interval);
      break;
  }
  return date;
};

export const getStartOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getEndOfWeek = (d = new Date()) => {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};
