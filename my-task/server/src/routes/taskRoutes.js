import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { createTaskValidator, updateTaskValidator, taskIdParamValidator } from '../validators/taskValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadAttachment } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.get('/', taskController.getTasks);
router.post('/', createTaskValidator, handleValidationErrors, taskController.createTask);
router.post('/bulk', taskController.bulkTaskAction);

router.get('/:id', taskIdParamValidator, handleValidationErrors, taskController.getTaskById);
router.patch('/:id', updateTaskValidator, handleValidationErrors, taskController.updateTask);
router.delete('/:id', taskIdParamValidator, handleValidationErrors, taskController.deleteTask);
router.patch('/:id/complete', taskIdParamValidator, handleValidationErrors, taskController.toggleTaskComplete);

// Subtasks
router.post('/:id/subtasks', taskIdParamValidator, handleValidationErrors, taskController.addSubtask);
router.patch('/:id/subtasks/:subtaskId', taskController.toggleSubtask);

// Attachments
router.post('/:id/attachments', uploadAttachment.single('file'), taskController.uploadTaskAttachment);

export default router;
