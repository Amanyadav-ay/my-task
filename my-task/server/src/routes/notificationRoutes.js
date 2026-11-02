import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/subscribe', notificationController.subscribe);
router.delete('/subscribe', notificationController.unsubscribe);
router.get('/vapid-key', notificationController.getVapidPublicKey);

export default router;
