import * as notificationService from '../services/notificationService.js';
import { sendResponse } from '../utils/helpers.js';
import { config } from '../config/env.js';

export const getNotifications = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 30;
    const data = await notificationService.getNotifications(req.user.id, limit);
    return sendResponse(res, 200, true, 'Notifications retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markAsRead(req.user.id, req.params.id);
    return sendResponse(res, 200, true, 'Notification marked as read', updated);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return sendResponse(res, 200, true, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req, res, next) => {
  try {
    const pushSub = await notificationService.savePushSubscription(req.user.id, req.body);
    return sendResponse(res, 201, true, 'Push subscription saved', pushSub);
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    await notificationService.removePushSubscription(req.user.id, endpoint);
    return sendResponse(res, 200, true, 'Push subscription removed');
  } catch (error) {
    next(error);
  }
};

export const getVapidPublicKey = async (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'VAPID public key', {
      publicKey: config.vapid.publicKey,
    });
  } catch (error) {
    next(error);
  }
};
