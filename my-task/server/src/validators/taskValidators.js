import { body, param, query } from 'express-validator';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title must not exceed 200 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'])
    .withMessage('Invalid task status'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date'),
  body('estimatedDuration')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1440 })
    .withMessage('Estimated duration must be between 1 and 1440 minutes'),
];

export const updateTaskValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid task ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title must not exceed 200 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'])
    .withMessage('Invalid task status'),
];

export const taskIdParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid task ID format'),
];
