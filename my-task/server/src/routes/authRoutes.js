import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/authValidators.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, handleValidationErrors, authController.register);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, handleValidationErrors, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, handleValidationErrors, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

export default router;
