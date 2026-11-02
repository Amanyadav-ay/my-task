import { body } from 'express-validator';

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('userType')
    .optional()
    .isIn(['student', 'professional', 'freelancer', 'personal'])
    .withMessage('User type must be student, professional, freelancer, or personal'),
];

export const updatePreferencesValidator = [
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be boolean'),
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications must be boolean'),
  body('pomodoroWorkDuration')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Pomodoro duration must be between 5 and 120 minutes'),
];
