import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MyDayPage from './pages/MyDayPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import FocusPage from './pages/FocusPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AchievementsPage from './pages/AchievementsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg dark:bg-main-darkBg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirects to dashboard if already logged in)
const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Pages (with AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <LoginPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicAuthRoute>
              <SignupPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicAuthRoute>
              <ForgotPasswordPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicAuthRoute>
              <ResetPasswordPage />
            </PublicAuthRoute>
          }
        />
      </Route>

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Dashboard & Workspace (with MainLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-day" element={<MyDayPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
