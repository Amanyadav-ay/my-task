import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Sparkles,
  Target,
  Calendar,
  Timer,
  BarChart3,
  Award,
  ArrowRight,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-main-bg dark:bg-main-darkBg text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Modern Navigation Bar */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">
              MY TASK
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Productivity Platform
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#students" className="hover:text-primary transition-colors">For Students</a>
          <a href="#professionals" className="hover:text-primary transition-colors">For Professionals</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary" />
            Next-Gen Productivity Suite 2026
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Organize Your Tasks.{' '}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Achieve Your Goals.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your personal productivity companion to plan smarter, stay focused, manage deadlines, and track every achievement.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-base font-bold shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-card-darkBg border border-slate-200 dark:border-card-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold shadow-sm transition-all text-center"
            >
              Explore Features
            </a>
          </div>

          {/* Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Free Forever Tier
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> PostgreSQL & Prisma Persistence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Smart AI Task Breakdown
            </span>
          </div>
        </div>
      </section>

      {/* 3. Dashboard Preview Mockup */}
      <section className="max-w-6xl mx-auto px-6 -mt-8 sm:-mt-16 mb-24">
        <div className="relative rounded-3xl p-3 bg-gradient-to-b from-primary/30 to-purple-600/10 shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-bold text-slate-400">app.mytask.local / dashboard</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-bold">
                ● Live Database Sync
              </span>
            </div>

            {/* Mock stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-bold">Total Tasks</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">24</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-bold">Completed</span>
                <p className="text-2xl font-black text-green-500 mt-1">18</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-bold">In Progress</span>
                <p className="text-2xl font-black text-primary mt-1">5</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-bold">Completion Rate</span>
                <p className="text-2xl font-black text-purple-500 mt-1">75%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Key Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/60 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Everything In One Place</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Designed for Modern Productivity
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A complete suite of intelligent tools built to give you total control over your schedule, focus, and long-term milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Task Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Organize tasks with categories, priority levels, subtask checklists, recurring rules, attachments, and notes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Target className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Goal & Milestone Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Set long-term goals and let My Task automatically compute progress percentages based on milestone achievements.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Interactive FullCalendar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visualize deadlines in Month, Week, or Day views. Drag and drop tasks to reschedule dates instantly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Timer className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pomodoro Focus Timer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Timestamp-based focus timer that never pauses when switching tabs. Saves completed focus sessions to database.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Productivity Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Break down complex projects into daily actionable tasks. Review and confirm AI suggestions before saving.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recharts Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real calculations of weekly created vs completed tasks, category distributions, and monthly performance trends.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Audience Section: Students & Professionals */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 py-20 px-6 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tailored Dashboards</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for Every Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div id="students" className="p-8 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Students</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep up with coursework, midterms, and team assignments effortlessly.
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Study Planner & Subject Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Exam Countdowns & Revision Schedules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Assignment Tracker with Attachments
                </li>
              </ul>
            </div>

            {/* Professional Card */}
            <div id="professionals" className="p-8 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Professionals & Freelancers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Meet critical sprint deadlines, coordinate client deliverables, and protect focus hours.
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Project Milestones & Deliverable Tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Meeting Planner & Priority Matrices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Weekly Performance Reports & Archive
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-16 bg-gradient-to-tr from-[#161E2E] to-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Master Your Day?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of learners and professionals who organize their tasks and achieve their long-term goals with My Task.
            </p>
            <div className="pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-base font-bold shadow-xl shadow-primary/30 transition-all active:scale-95"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="font-bold text-slate-800 dark:text-white">MY TASK</span>
            <span>— Plan Your Day. Track Your Progress. Achieve Your Goals.</span>
          </div>
          <div>
            © 2026 MY TASK Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
