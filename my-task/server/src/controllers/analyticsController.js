import * as analyticsService from '../services/analyticsService.js';
import { sendResponse } from '../utils/helpers.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardAnalytics(req.user.id);
    return sendResponse(res, 200, true, 'Dashboard analytics retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getWeeklyAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getWeeklyProductivity(req.user.id);
    return sendResponse(res, 200, true, 'Weekly productivity retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getMonthlyProductivity(req.user.id);
    return sendResponse(res, 200, true, 'Monthly productivity retrieved', data);
  } catch (error) {
    next(error);
  }
};
