import { Router } from 'express';
import * as calendarController from '../controllers/calendarController.js';
import { requireAuth } from '../middleware/auth.js';
import { createCalendarEventValidator, updateCalendarEventValidator } from '../validators/calendarValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.get('/events', calendarController.getEvents);
router.post('/events', createCalendarEventValidator, handleValidationErrors, calendarController.createEvent);
router.patch('/events/:id', updateCalendarEventValidator, handleValidationErrors, calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

export default router;
