import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Zap,
  Target,
  Flag,
  Trophy,
  Clock,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import api from '../services/api.js';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const res = await api.get('/achievements');
      if (res.data?.success) {
        setAchievements(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const totalPoints = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + (a.points || 0), 0);

  const getBadgeIcon = (code) => {
    switch (code) {
      case 'FIRST_TASK':
        return CheckCircle2;
      case 'TASK_MASTER_10':
        return Zap;
      case 'TASK_CENTURION':
        return Award;
      case 'GOAL_SETTER':
        return Target;
      case 'MILESTONE_CRUSHER':
        return Flag;
      case 'GOAL_ACHIEVER':
        return Trophy;
      case 'FOCUS_INITIATE':
        return Clock;
      case 'FOCUS_CHAMPION':
        return Shield;
      default:
        return Sparkles;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'PLATINUM':
        return 'border-cyan-400 bg-cyan-50/50 text-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-300';
      case 'GOLD':
        return 'border-amber-400 bg-amber-50/50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300';
      case 'SILVER':
        return 'border-slate-300 bg-slate-100/50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300';
      default: // BRONZE
        return 'border-orange-300 bg-orange-50/50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-xl shadow-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Trophy className="w-4 h-4 text-amber-300" />
            Milestones & Badges
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Achievements
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-md">
            Earn motivational badges as you build healthy study and work habits. Badges are unlocked automatically from real task execution.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-purple-200">Unlocked</span>
            <p className="text-2xl font-black mt-0.5">
              {unlockedCount} / {totalCount}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[110px]">
            <span className="text-[10px] uppercase font-bold text-purple-200">Points</span>
            <p className="text-2xl font-black text-amber-300 mt-0.5">
              {totalPoints} pts
            </p>
          </div>
        </div>
      </div>

      {/* 2. Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((ach) => {
          const Icon = getBadgeIcon(ach.code);
          const isUnlocked = ach.isUnlocked;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 relative ${
                isUnlocked
                  ? 'bg-white dark:bg-card-darkBg border-primary/40 shadow-card hover:shadow-cardHover'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-primary to-purple-600 text-white shadow-md shadow-primary/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getLevelColor(
                      ach.badgeLevel
                    )}`}
                  >
                    {ach.badgeLevel}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {ach.title}
                    {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className="text-primary">+{ach.points} pts</span>
                <span className={isUnlocked ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}>
                  {isUnlocked ? 'Unlocked ✓' : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
