import { body, param } from 'express-validator';

export const createCalendarEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required'),
  body('start')
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date'),
  body('end')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date'),
];

export const updateCalendarEventValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid calendar event ID'),
];
