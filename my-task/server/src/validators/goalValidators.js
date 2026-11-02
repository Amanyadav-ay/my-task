import { body, param } from 'express-validator';

export const createGoalValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Goal title is required')
    .isLength({ max: 200 })
    .withMessage('Goal title must not exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['IN_PROGRESS', 'COMPLETED', 'ARCHIVED', 'PAUSED'])
    .withMessage('Invalid goal status'),
  body('targetDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Target date must be a valid ISO8601 date'),
];

export const updateGoalValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid goal ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Goal title cannot be empty'),
  body('status')
    .optional()
    .isIn(['IN_PROGRESS', 'COMPLETED', 'ARCHIVED', 'PAUSED'])
    .withMessage('Invalid goal status'),
];
