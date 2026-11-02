import * as goalService from '../services/goalService.js';
import { sendResponse } from '../utils/helpers.js';

export const getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getGoals(req.user.id, req.query);
    return sendResponse(res, 200, true, 'Goals retrieved', goals);
  } catch (error) {
    next(error);
  }
};

export const getGoalById = async (req, res, next) => {
  try {
    const goal = await goalService.getGoalById(req.user.id, req.params.id);
    return sendResponse(res, 200, true, 'Goal details retrieved', goal);
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Goal created successfully', goal);
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body);
    return sendResponse(res, 200, true, 'Goal updated successfully', goal);
  } catch (error) {
    next(error);
  }
};

export const toggleMilestone = async (req, res, next) => {
  try {
    const goal = await goalService.toggleMilestone(req.user.id, req.params.id, req.params.milestoneId);
    return sendResponse(res, 200, true, 'Milestone toggled successfully', goal);
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    await goalService.deleteGoal(req.user.id, req.params.id);
    return sendResponse(res, 200, true, 'Goal deleted successfully');
  } catch (error) {
    next(error);
  }
};
