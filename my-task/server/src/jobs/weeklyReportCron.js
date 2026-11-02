import cron from 'node-cron';
import prisma from '../config/database.js';
import { generateWeeklyReport } from '../services/weeklyReportService.js';
import { sendEmail } from '../config/mailer.js';

export const startWeeklyReportJob = () => {
  // Run every Sunday at 23:55
  cron.schedule('55 23 * * 0', async () => {
    try {
      console.log('📊 Starting automated weekly report generation for all active users...');
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, preferences: true },
      });

      for (const user of users) {
        try {
          const report = await generateWeeklyReport(user.id);

          if (user.preferences?.emailNotifications) {
            sendEmail({
              to: user.email,
              subject: `Your Weekly Productivity Summary - My Task`,
              text: `Hello ${user.name},\n\nHere is your weekly summary:\nTasks Completed: ${report.tasksCompleted}\nTasks Created: ${report.tasksCreated}\nFocus Time: ${report.focusTimeMinutes} minutes\n\n${report.summaryNotes}`,
            }).catch(() => {});
          }
        } catch (uErr) {
          console.error(`Failed to generate weekly report for user ${user.id}:`, uErr.message);
        }
      }
    } catch (err) {
      console.error('Error in Weekly Report Cron Job:', err.message);
    }
  });

  console.log('📊 Weekly Report Cron Job initialized (runs Sundays at 23:55)');
};
