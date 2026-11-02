import { Router } from 'express';
import * as achievementController from '../controllers/achievementController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', achievementController.getAchievements);

export default router;
