import * as aiService from '../services/aiService.js';
import { sendResponse } from '../utils/helpers.js';

export const breakdownTask = async (req, res, next) => {
  try {
    const { prompt, days } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return sendResponse(res, 400, false, 'Please provide a valid goal or task prompt to break down');
    }

    const plan = await aiService.breakdownTaskWithAI(prompt, days);
    return sendResponse(res, 200, true, 'Task breakdown generated successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const suggestSchedule = async (req, res, next) => {
  try {
    const schedule = await aiService.suggestSmartSchedule(req.user.id);
    return sendResponse(res, 200, true, 'Smart schedule suggestions generated', schedule);
  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await aiService.getProductivitySuggestions(req.user.id);
    return sendResponse(res, 200, true, 'Productivity suggestions retrieved', suggestions);
  } catch (error) {
    next(error);
  }
};
