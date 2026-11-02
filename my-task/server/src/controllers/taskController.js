import * as taskService from '../services/taskService.js';
import prisma from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasks(req.user.id, req.query);
    return sendResponse(res, 200, true, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.user.id, req.params.id);
    return sendResponse(res, 200, true, 'Task details retrieved', task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
    return sendResponse(res, 200, true, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
};

export const toggleTaskComplete = async (req, res, next) => {
  try {
    const task = await taskService.toggleTaskComplete(req.user.id, req.params.id);
    return sendResponse(res, 200, true, `Task marked as ${task.status.toLowerCase()}`, task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.user.id, req.params.id);
    return sendResponse(res, 200, true, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { subtasks: true },
    });

    if (!task) {
      return sendResponse(res, 404, false, 'Task not found');
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId: task.id,
        title,
        sortOrder: task.subtasks.length,
      },
    });

    return sendResponse(res, 201, true, 'Subtask added', subtask);
  } catch (error) {
    next(error);
  }
};

export const toggleSubtask = async (req, res, next) => {
  try {
    const subtask = await prisma.subtask.findFirst({
      where: {
        id: req.params.subtaskId,
        task: { userId: req.user.id, id: req.params.id },
      },
      include: { task: { include: { subtasks: true } } },
    });

    if (!subtask) {
      return sendResponse(res, 404, false, 'Subtask not found');
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtask.id },
      data: { isCompleted: !subtask.isCompleted },
    });

    // Recalculate task progress percentage
    const allSubtasks = await prisma.subtask.findMany({
      where: { taskId: subtask.taskId },
    });
    const completedCount = allSubtasks.filter((s) => s.isCompleted).length;
    const progressPercentage = Math.round((completedCount / allSubtasks.length) * 100);

    await prisma.task.update({
      where: { id: subtask.taskId },
      data: {
        progressPercentage,
        status: progressPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });

    return sendResponse(res, 200, true, 'Subtask updated', updatedSubtask);
  } catch (error) {
    next(error);
  }
};

export const uploadTaskAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'No file uploaded');
    }

    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!task) {
      return sendResponse(res, 404, false, 'Task not found');
    }

    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId: task.id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });

    return sendResponse(res, 201, true, 'Attachment uploaded successfully', attachment);
  } catch (error) {
    next(error);
  }
};

export const bulkTaskAction = async (req, res, next) => {
  try {
    const { taskIds = [], action, newDueDate } = req.body;
    if (!taskIds.length) {
      return sendResponse(res, 400, false, 'No task IDs provided');
    }

    if (action === 'COMPLETE') {
      await prisma.task.updateMany({
        where: { id: { in: taskIds }, userId: req.user.id },
        data: { status: 'COMPLETED', completedAt: new Date(), progressPercentage: 100 },
      });
      return sendResponse(res, 200, true, `Marked ${taskIds.length} tasks as complete`);
    }

    if (action === 'DELETE') {
      await prisma.task.deleteMany({
        where: { id: { in: taskIds }, userId: req.user.id },
      });
      return sendResponse(res, 200, true, `Deleted ${taskIds.length} tasks`);
    }

    if (action === 'RESCHEDULE' && newDueDate) {
      await prisma.task.updateMany({
        where: { id: { in: taskIds }, userId: req.user.id },
        data: { dueDate: new Date(newDueDate) },
      });
      return sendResponse(res, 200, true, `Rescheduled ${taskIds.length} tasks to ${newDueDate}`);
    }

    return sendResponse(res, 400, false, 'Unknown bulk action');
  } catch (error) {
    next(error);
  }
};
