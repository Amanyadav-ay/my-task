import * as weeklyReportService from '../services/weeklyReportService.js';
import { sendResponse } from '../utils/helpers.js';

export const getReports = async (req, res, next) => {
  try {
    const reports = await weeklyReportService.getWeeklyReports(req.user.id);
    return sendResponse(res, 200, true, 'Weekly reports retrieved', reports);
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req, res, next) => {
  try {
    const report = await weeklyReportService.generateWeeklyReport(req.user.id);
    return sendResponse(res, 201, true, 'Weekly report generated successfully', report);
  } catch (error) {
    next(error);
  }
};
