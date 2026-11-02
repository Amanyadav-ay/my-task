import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import api from '../services/api.js';
import confetti from 'canvas-confetti';

export default function FocusPage() {
  const location = useLocation();
  const queryTaskId = new URLSearchParams(location.search).get('taskId') || '';

  // Timer Modes
  const [mode, setMode] = useState('WORK'); // WORK (25m), SHORT_BREAK (5m), LONG_BREAK (15m)
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selected Task
  const [selectedTaskId, setSelectedTaskId] = useState(queryTaskId);
  const [tasks, setTasks] = useState([]);

  // Session History
  const [focusStats, setFocusStats] = useState({ sessions: [], totalWorkMinutes: 0, totalSessionsCount: 0 });

  // Timestamp-based timing references
  const targetEndTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load user's pending tasks & focus session history
  const fetchFocusData = useCallback(async () => {
    try {
      const [taskRes, focusRes] = await Promise.all([
        api.get('/tasks?status=ACTIVE'),
        api.get('/focus'),
      ]);
      if (taskRes.data?.success) setTasks(taskRes.data.data);
      if (focusRes.data?.success) setFocusStats(focusRes.data.data);
    } catch (err) {
      console.error('Error fetching focus data:', err);
    }
  }, []);

  useEffect(() => {
    fetchFocusData();
  }, [fetchFocusData]);

  // Mode switcher
  const handleSelectMode = (newMode, minutes) => {
    setIsActive(false);
    clearInterval(timerIntervalRef.current);
    setMode(newMode);
    setDurationMinutes(minutes);
    setTimeLeftSeconds(minutes * 60);
    targetEndTimeRef.current = null;
  };

  // Start / Resume Timer (Timestamp-based)
  const handleStart = () => {
    if (isActive) return;
    setIsActive(true);

    const now = Date.now();
    // Set target end timestamp based on current timeLeftSeconds
    targetEndTimeRef.current = now + timeLeftSeconds * 1000;

    timerIntervalRef.current = setInterval(() => {
      const remainingMs = targetEndTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setTimeLeftSeconds(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(timerIntervalRef.current);
        setIsActive(false);
        handleTimerCompleted();
      }
    }, 500); // Check every 500ms for high precision
  };

  // Pause Timer
  const handlePause = () => {
    setIsActive(false);
    clearInterval(timerIntervalRef.current);
    targetEndTimeRef.current = null;
  };

  // Reset Timer
  const handleReset = () => {
    setIsActive(false);
    clearInterval(timerIntervalRef.current);
    targetEndTimeRef.current = null;
    setTimeLeftSeconds(durationMinutes * 60);
  };

  // Session Completed
  const handleTimerCompleted = async () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    // Audio chime if enabled
    if (soundEnabled) {
      playChime();
    }

    try {
      // Save session in database
      await api.post('/focus', {
        taskId: selectedTaskId || null,
        durationMinutes,
        type: mode,
        completed: true,
      });

      fetchFocusData();
    } catch (err) {
      console.error('Failed to log completed focus session:', err);
    }
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      //
    }
  };

  // Format Time Display
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Compute Circle Progress
  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeftSeconds) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 754 - (754 * progressPercent) / 100;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* 1. Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Timer className="w-4 h-4" />
          Pomodoro Focus Mode
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Deep Work Session
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Work in focused sprints. Accurate timestamp-based timing continues even in background tabs.
        </p>
      </div>

      {/* 2. Timer Container */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-xl text-center space-y-8">
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleSelectMode('WORK', 25)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'WORK'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => handleSelectMode('SHORT_BREAK', 5)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'SHORT_BREAK'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSelectMode('LONG_BREAK', 15)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'LONG_BREAK'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="120"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="120"
              className="text-primary transition-all duration-500 ease-linear"
              strokeWidth="12"
              strokeDasharray={754}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {timeString}
            </span>
            <span className="text-xs uppercase font-bold text-slate-400 mt-2 tracking-widest">
              {mode === 'WORK' ? 'Deep Work' : 'Rest Break'}
            </span>
          </div>
        </div>

        {/* Task Selector */}
        <div className="max-w-md mx-auto space-y-1.5 text-left">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Target Task For This Session:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:border-primary"
          >
            <option value="">General Focus (No specific task)</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.priority})
              </option>
            ))}
          </select>
        </div>

        {/* Controls: Play, Pause, Reset */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isActive ? (
            <button
              onClick={handlePause}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <Pause className="w-5 h-5 fill-white" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-xl shadow-primary/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Focus</span>
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl transition-colors ${
              soundEnabled
                ? 'bg-primary/10 text-primary'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Focus Session Stats & History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Focus Time</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {focusStats.totalWorkMinutes} <span className="text-base font-medium text-slate-400">minutes</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Logged from completed deep work sessions</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sessions Completed</span>
          <p className="text-3xl font-extrabold text-primary mt-2">
            {focusStats.totalSessionsCount} <span className="text-base font-medium text-slate-400">sessions</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Sustained distraction-free intervals</p>
        </div>
      </div>
    </div>
  );
}
