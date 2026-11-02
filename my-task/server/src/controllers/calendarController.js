import * as calendarService from '../services/calendarService.js';
import { sendResponse } from '../utils/helpers.js';

export const getEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const events = await calendarService.getCalendarEvents(req.user.id, start, end);
    return sendResponse(res, 200, true, 'Calendar events retrieved', events);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await calendarService.createCalendarEvent(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Calendar event created', event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await calendarService.updateCalendarEvent(req.user.id, req.params.id, req.body);
    return sendResponse(res, 200, true, 'Calendar event updated', event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await calendarService.deleteCalendarEvent(req.user.id, req.params.id);
    return sendResponse(res, 200, true, 'Calendar event deleted');
  } catch (error) {
    next(error);
  }
};
