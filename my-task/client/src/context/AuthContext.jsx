import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success) {
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateProfile = async (data) => {
    const res = await api.patch('/users/me', data);
    if (res.data?.success) {
      setUser((prev) => ({ ...prev, ...res.data.data }));
      return res.data.data;
    }
  };

  const updatePreferences = async (prefs) => {
    const res = await api.patch('/users/preferences', prefs);
    if (res.data?.success) {
      setUser((prev) => ({
        ...prev,
        preferences: res.data.data,
      }));
      return res.data.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
