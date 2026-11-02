import { Router } from 'express';
import * as focusController from '../controllers/focusController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', focusController.getFocusSessions);
router.post('/', focusController.createFocusSession);

export default router;
