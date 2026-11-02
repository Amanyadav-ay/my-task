import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import { sendResponse } from '../utils/helpers.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Authentication required. Please log in.');
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return sendResponse(res, 401, false, 'Invalid or expired session. Please log in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendResponse(res, 401, false, 'User account no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return sendResponse(res, 500, false, 'Authentication error.');
  }
};
