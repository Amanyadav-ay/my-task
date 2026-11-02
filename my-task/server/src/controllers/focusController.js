import * as focusService from '../services/focusService.js';
import { sendResponse } from '../utils/helpers.js';

export const getFocusSessions = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const data = await focusService.getFocusSessions(req.user.id, limit);
    return sendResponse(res, 200, true, 'Focus sessions retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const createFocusSession = async (req, res, next) => {
  try {
    const session = await focusService.createFocusSession(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Focus session logged successfully', session);
  } catch (error) {
    next(error);
  }
};
