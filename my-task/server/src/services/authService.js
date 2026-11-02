import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../config/mailer.js';
import { config } from '../config/env.js';

export const registerUser = async ({ name, email, password, userType = 'personal' }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.isPublic = true;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      userType,
      isVerified: true, // Activated by default for seamless developer experience
      preferences: {
        create: {
          theme: 'light',
          emailNotifications: true,
          pushNotifications: false,
          pomodoroWorkDuration: 25,
          pomodoroShortBreak: 5,
          pomodoroLongBreak: 15,
        },
      },
    },
    include: {
      preferences: true,
    },
  });

  // Seed default categories according to userType
  await createDefaultCategories(user.id, userType);

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.userType });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh session in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async ({ email, password, userAgent, ipAddress }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { preferences: true },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isPublic = true;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isPublic = true;
    throw error;
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.userType });
  const refreshToken = generateRefreshToken({ userId: user.id });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      token: refreshToken,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshSession = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    const error = new Error('Refresh token is required.');
    error.statusCode = 401;
    error.isPublic = true;
    throw error;
  }

  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded) {
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    error.isPublic = true;
    throw error;
  }

  const session = await prisma.refreshSession.findUnique({
    where: { token: oldRefreshToken },
    include: { user: { include: { preferences: true } } },
  });

  if (!session || new Date() > session.expiresAt) {
    if (session) {
      await prisma.refreshSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    const error = new Error('Session has expired. Please log in again.');
    error.statusCode = 401;
    error.isPublic = true;
    throw error;
  }

  // Token rotation
  const newAccessToken = generateAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.userType,
  });
  const newRefreshToken = generateRefreshToken({ userId: session.user.id });

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + config.jwt.refreshExpiresInDays);

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: {
      token: newRefreshToken,
      expiresAt: newExpiresAt,
    },
  });

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      userType: session.user.userType,
      avatarUrl: session.user.avatarUrl,
      preferences: session.user.preferences,
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await prisma.refreshSession.deleteMany({
      where: { token: refreshToken },
    }).catch(() => {});
  }
  return true;
};

export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security reasons, do not reveal whether user exists
    return true;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password - My Task',
    text: `Click the link to reset your password: ${resetUrl}`,
    html: `<p>Hello ${user.name},</p><p>You requested a password reset for your My Task account. Click the button below to set a new password:</p><p><a href="${resetUrl}" style="background-color: #6C4DE6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p><p>This link will expire in 1 hour.</p>`,
  });

  return true;
};

export const resetPassword = async (token, newPassword) => {
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetRecord || new Date() > resetRecord.expiresAt) {
    const error = new Error('Password reset token is invalid or has expired.');
    error.statusCode = 400;
    error.isPublic = true;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { passwordHash },
  });

  // Revoke all existing sessions on password change
  await prisma.refreshSession.deleteMany({
    where: { userId: resetRecord.userId },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetRecord.id },
  });

  return true;
};

export const createDefaultCategories = async (userId, userType) => {
  let categories = [];
  if (userType === 'student') {
    categories = [
      { name: 'Study Planner', color: '#6C4DE6', icon: 'book' },
      { name: 'Assignments', color: '#3B82F6', icon: 'file-text' },
      { name: 'Exams & Revision', color: '#EF4444', icon: 'alert-circle' },
      { name: 'Projects', color: '#10B981', icon: 'folder' },
    ];
  } else if (userType === 'professional') {
    categories = [
      { name: 'Work Tasks', color: '#6C4DE6', icon: 'briefcase' },
      { name: 'Meetings', color: '#F59E0B', icon: 'users' },
      { name: 'Project Deadlines', color: '#EF4444', icon: 'clock' },
      { name: 'Strategy', color: '#8B5CF6', icon: 'target' },
    ];
  } else if (userType === 'freelancer') {
    categories = [
      { name: 'Client Deliverables', color: '#6C4DE6', icon: 'send' },
      { name: 'Proposals & Pitching', color: '#3B82F6', icon: 'file' },
      { name: 'Invoicing & Admin', color: '#10B981', icon: 'dollar-sign' },
      { name: 'Client Feedback', color: '#F59E0B', icon: 'message-square' },
    ];
  } else {
    categories = [
      { name: 'Personal Routine', color: '#6C4DE6', icon: 'sun' },
      { name: 'Health & Fitness', color: '#10B981', icon: 'activity' },
      { name: 'Finance & Bills', color: '#F59E0B', icon: 'credit-card' },
      { name: 'Learning & Reading', color: '#3B82F6', icon: 'book-open' },
    ];
  }

  for (const cat of categories) {
    await prisma.taskCategory.create({
      data: {
        userId,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        isSystem: true,
      },
    });
  }
};
