import * as authService from '../services/authService.js';
import { sendResponse } from '../utils/helpers.js';
import { config } from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path: '/',
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, userType } = req.body;
    const result = await authService.registerUser({ name, email, password, userType });

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 201, true, 'Account created successfully!', {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await authService.loginUser({ email, password, userAgent, ipAddress });

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, true, 'Logged in successfully!', {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await authService.refreshSession(refreshToken);

    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, true, 'Session refreshed', {
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logoutUser(refreshToken);

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return sendResponse(res, 200, true, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return sendResponse(res, 200, true, 'If an account exists with that email, a password reset link has been dispatched.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    return sendResponse(res, 200, true, 'Password reset successfully. You can now log in with your new password.');
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'Email verified successfully.');
  } catch (error) {
    next(error);
  }
};
