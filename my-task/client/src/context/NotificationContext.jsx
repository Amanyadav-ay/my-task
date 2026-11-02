import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (err) {
      // fail silently
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (!user) return;

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        const vapidRes = await api.get('/notifications/vapid-key');
        const publicKey = vapidRes.data?.data?.publicKey;
        if (!publicKey || publicKey.includes('placeholder')) {
          return true;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await api.post('/notifications/subscribe', subscription);
        return true;
      } catch (err) {
        console.warn('Push subscription failed:', err);
      }
    }
    return false;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useNotifications = () => useContext(NotificationContext);
