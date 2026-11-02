import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';
import goalRoutes from './goalRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import focusRoutes from './focusRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import achievementRoutes from './achievementRoutes.js';
import weeklyReportRoutes from './weeklyReportRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/goals', goalRoutes);
router.use('/calendar', calendarRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/focus', focusRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/achievements', achievementRoutes);
router.use('/reports', weeklyReportRoutes);

export default router;
