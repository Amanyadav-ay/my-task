import { Router } from 'express';
import * as goalController from '../controllers/goalController.js';
import { requireAuth } from '../middleware/auth.js';
import { createGoalValidator, updateGoalValidator } from '../validators/goalValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/', goalController.getGoals);
router.post('/', createGoalValidator, handleValidationErrors, goalController.createGoal);
router.get('/:id', goalController.getGoalById);
router.patch('/:id', updateGoalValidator, handleValidationErrors, goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

// Milestones
router.patch('/:id/milestones/:milestoneId', goalController.toggleMilestone);

export default router;
