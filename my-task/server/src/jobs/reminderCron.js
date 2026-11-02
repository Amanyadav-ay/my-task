import cron from 'node-cron';
import prisma from '../config/database.js';
import { createInAppNotification } from '../services/notificationService.js';
import { sendEmail } from '../config/mailer.js';

export const startReminderJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // Find pending tasks with due dates in the next 48 hours
      const upcomingTasks = await prisma.task.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { gte: now, lte: next48Hours },
        },
        include: {
          user: { include: { preferences: true } },
          notifications: true,
        },
      });

      for (const task of upcomingTasks) {
        const timeDiffMs = new Date(task.dueDate).getTime() - now.getTime();
        const hoursRemaining = Math.round(timeDiffMs / (1000 * 60 * 60));
        const daysRemaining = Math.round(hoursRemaining / 24);

        let triggerReminder = false;
        let reminderMessage = '';

        // Check if a reminder for this task was already sent in the last 12 hours
        const recentNotification = task.notifications.find(
          (n) => n.type === 'REMINDER' && (now.getTime() - new Date(n.createdAt).getTime()) < 12 * 60 * 60 * 1000
        );

        if (!recentNotification) {
          if (hoursRemaining <= 1) {
            triggerReminder = true;
            reminderMessage = `URGENT: Your task "${task.title}" is due in less than an hour!`;
          } else if (hoursRemaining <= 3) {
            triggerReminder = true;
            reminderMessage = `Reminder: Your task "${task.title}" is due in ${hoursRemaining} hours.`;
          } else if (daysRemaining === 1) {
            triggerReminder = true;
            reminderMessage = `Upcoming deadline: "${task.title}" is due tomorrow.`;
          } else if (daysRemaining === 2) {
            triggerReminder = true;
            reminderMessage = `Heads up: "${task.title}" is due in 2 days.`;
          }
        }

        if (triggerReminder && reminderMessage) {
          await createInAppNotification({
            userId: task.userId,
            title: 'Deadline Approaching ⏰',
            message: reminderMessage,
            type: 'REMINDER',
            taskId: task.id,
          });

          // Optional email reminder if user enabled email notifications
          if (task.user?.preferences?.emailNotifications) {
            sendEmail({
              to: task.user.email,
              subject: `Reminder: ${task.title} is approaching its deadline`,
              text: reminderMessage,
            }).catch(() => {});
          }
        }
      }

      // Overdue task alert checks
      const overdueTasks = await prisma.task.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: now },
        },
        include: { notifications: true },
        take: 50,
      });

      for (const task of overdueTasks) {
        const hasOverdueNotice = task.notifications.some((n) => n.type === 'DEADLINE');
        if (!hasOverdueNotice) {
          await createInAppNotification({
            userId: task.userId,
            title: 'Task Overdue ⚠️',
            message: `"${task.title}" is past its due date. Reschedule or mark complete to keep your progress on track.`,
            type: 'DEADLINE',
            taskId: task.id,
          });
        }
      }
    } catch (err) {
      console.error('Error in Reminder Cron Job:', err.message);
    }
  });

  console.log('⏰ Reminder Cron Job initialized (runs every 5 mins)');
};
