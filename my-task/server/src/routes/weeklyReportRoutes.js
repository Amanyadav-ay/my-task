import { Router } from 'express';
import * as weeklyReportController from '../controllers/weeklyReportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', weeklyReportController.getReports);
router.post('/generate', weeklyReportController.generateReport);

export default router;
