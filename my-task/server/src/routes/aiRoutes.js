import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(requireAuth);
router.use(aiLimiter);

router.post('/breakdown', aiController.breakdownTask);
router.post('/schedule', aiController.suggestSchedule);
router.get('/suggestions', aiController.getSuggestions);

export default router;
