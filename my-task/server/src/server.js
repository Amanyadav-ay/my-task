import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { startReminderJob } from './jobs/reminderCron.js';
import { startWeeklyReportJob } from './jobs/weeklyReportCron.js';

const startServer = async () => {
  console.log('🚀 Starting MY TASK Full-Stack Productivity Server...');

  // Connect Database
  await connectDatabase();

  // Initialize Scheduled Background Jobs
  startReminderJob();
  startWeeklyReportJob();

  // Start HTTP Server
  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🎯 MY TASK API Server is running on port ${config.port}`);
    console.log(`🌐 Health check: http://localhost:${config.port}/api/health`);
    console.log(`🔒 Mode: ${config.env}`);
    console.log(`====================================================`);
  });

  // Graceful Shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log('💤 HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
