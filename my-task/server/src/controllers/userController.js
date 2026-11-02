import prisma from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,
        preferences: true,
      },
    });
    return sendResponse(res, 200, true, 'User profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, userType, avatarUrl } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (userType) updateData.userType = userType;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,
        preferences: true,
      },
    });

    return sendResponse(res, 200, true, 'Profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (req, res, next) => {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user.id },
    });
    return sendResponse(res, 200, true, 'User preferences retrieved', preferences);
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const {
      theme,
      emailNotifications,
      pushNotifications,
      pomodoroWorkDuration,
      pomodoroShortBreak,
      pomodoroLongBreak,
      soundEnabled,
      autoStartBreaks,
    } = req.body;

    const updated = await prisma.userPreferences.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        theme: theme || 'light',
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? false,
        pomodoroWorkDuration: pomodoroWorkDuration ? parseInt(pomodoroWorkDuration, 10) : 25,
        pomodoroShortBreak: pomodoroShortBreak ? parseInt(pomodoroShortBreak, 10) : 5,
        pomodoroLongBreak: pomodoroLongBreak ? parseInt(pomodoroLongBreak, 10) : 15,
        soundEnabled: soundEnabled ?? true,
        autoStartBreaks: autoStartBreaks ?? false,
      },
      update: {
        ...(theme !== undefined && { theme }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(pomodoroWorkDuration !== undefined && { pomodoroWorkDuration: parseInt(pomodoroWorkDuration, 10) }),
        ...(pomodoroShortBreak !== undefined && { pomodoroShortBreak: parseInt(pomodoroShortBreak, 10) }),
        ...(pomodoroLongBreak !== undefined && { pomodoroLongBreak: parseInt(pomodoroLongBreak, 10) }),
        ...(soundEnabled !== undefined && { soundEnabled }),
        ...(autoStartBreaks !== undefined && { autoStartBreaks }),
      },
    });

    return sendResponse(res, 200, true, 'Preferences updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.taskCategory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    return sendResponse(res, 200, true, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, color = '#6C4DE6', icon = 'tag' } = req.body;
    const category = await prisma.taskCategory.create({
      data: {
        userId: req.user.id,
        name,
        color,
        icon,
      },
    });
    return sendResponse(res, 201, true, 'Category created', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await prisma.taskCategory.deleteMany({
      where: { id: req.params.id, userId: req.user.id },
    });
    return sendResponse(res, 200, true, 'Category deleted');
  } catch (error) {
    next(error);
  }
};
