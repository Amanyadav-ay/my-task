import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { updateUserValidator, updatePreferencesValidator } from '../validators/userValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/me', userController.getMe);
router.patch('/me', updateUserValidator, handleValidationErrors, userController.updateMe);
router.get('/preferences', userController.getPreferences);
router.patch('/preferences', updatePreferencesValidator, handleValidationErrors, userController.updatePreferences);

// Categories
router.get('/categories', userController.getCategories);
router.post('/categories', userController.createCategory);
router.delete('/categories/:id', userController.deleteCategory);

export default router;
