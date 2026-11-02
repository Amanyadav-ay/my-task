import prisma from '../config/database.js';
import webpush from '../config/webpush.js';
import { sendEmail } from '../config/mailer.js';

export const getNotifications = async (userId, limit = 30) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        task: {
          select: { id: true, title: true, priority: true, dueDate: true },
        },
      },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return { notifications, unreadCount };
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    error.isPublic = true;
    throw error;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return true;
};

export const createInAppNotification = async ({ userId, title, message, type = 'REMINDER', taskId = null, scheduledFor = null }) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      taskId,
      scheduledFor,
      sentAt: scheduledFor ? null : new Date(),
    },
  });

  // Try dispatching web push notification if user has subscription
  dispatchPushNotification(userId, { title, message, type, taskId }).catch(() => {});

  return notification;
};

export const savePushSubscription = async (userId, subscription) => {
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new Error('Invalid push subscription structure');
  }

  const pushSub = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return pushSub;
};

export const removePushSubscription = async (userId, endpoint) => {
  await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
  return true;
};

export const dispatchPushNotification = async (userId, payload) => {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (!subscriptions || subscriptions.length === 0) return;

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.message,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    data: {
      url: payload.taskId ? `/tasks?id=${payload.taskId}` : '/notifications',
    },
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        pushPayload
      );
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired or gone, delete it
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }
};
