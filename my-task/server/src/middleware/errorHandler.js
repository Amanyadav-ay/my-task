import { sendResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Prisma known request errors
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return sendResponse(res, 409, false, `A duplicate record already exists${target}.`);
  }

  if (err.code === 'P2025') {
    return sendResponse(res, 404, false, 'The requested record was not found.');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendResponse(res, 400, false, 'File size too large. Maximum allowed size is 5MB.');
  }

  const statusCode = err.statusCode || 500;
  const message = err.isPublic ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return sendResponse(res, statusCode, false, message || 'An unexpected error occurred.');
};
