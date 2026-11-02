import * as achievementService from '../services/achievementService.js';
import { sendResponse } from '../utils/helpers.js';

export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await achievementService.getAchievements(req.user.id);
    return sendResponse(res, 200, true, 'Achievements retrieved', achievements);
  } catch (error) {
    next(error);
  }
};
