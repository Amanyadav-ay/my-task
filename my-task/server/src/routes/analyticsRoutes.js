import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', analyticsController.getDashboardMetrics);
router.get('/weekly', analyticsController.getWeeklyAnalytics);
router.get('/monthly', analyticsController.getMonthlyAnalytics);

export default router;
