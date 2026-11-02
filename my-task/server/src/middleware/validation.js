import { validationResult } from 'express-validator';
import { sendResponse } from '../utils/helpers.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: formatted[0]?.message || 'Validation failed',
      errors: formatted,
    });
  }
  next();
};
