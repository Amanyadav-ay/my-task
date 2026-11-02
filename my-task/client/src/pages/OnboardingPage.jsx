import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Laptop,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const [selectedType, setSelectedType] = useState(user?.userType || 'student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const options = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      color: 'blue',
      badge: 'Academics & Study',
      description:
        'Track assignments, manage subjects, study goals, exam countdowns, and daily coursework schedules.',
      features: ['Study Planner', 'Assignment Tracker', 'Exam Countdown', 'Subject Progress'],
    },
    {
      id: 'professional',
      title: 'Working Professional',
      icon: Briefcase,
      color: 'purple',
      badge: 'Corporate & Tech',
      description:
        'Stay ahead of sprints, manage project deliverables, meeting plans, priority matrix, and weekly reports.',
      features: ['Work Tasks', 'Project Milestones', 'Meeting Planner', 'Weekly Performance'],
    },
    {
      id: 'freelancer',
      title: 'Freelancer',
      icon: Laptop,
      color: 'emerald',
      badge: 'Clients & Contracts',
      description:
        'Manage multiple client projects, deliverable milestones, deadlines, and invoicing tasks effortlessly.',
      features: ['Client Deliverables', 'Project Milestones', 'Deliverable Tracking', 'Invoicing Tasks'],
    },
    {
      id: 'personal',
      title: 'Personal Use',
      icon: User,
      color: 'amber',
      badge: 'Lifestyle & Habits',
      description:
        'Build daily routines, track habits, personal fitness & finance goals, and manage everyday to-dos.',
      features: ['Daily Routine', 'Personal Goals', 'Habit Tracker', 'Important Reminders'],
    },
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateProfile({ userType: selectedType });
      // Trigger confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.error('Failed to update user profile:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main-bg dark:bg-main-darkBg text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Step 1 of 1: Personalize Your Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How do you plan to use My Task?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            We will customize your dashboard widgets, categories, and analytics according to your workflow. You can change this anytime from Settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedType(opt.id)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-card-darkBg hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-5 right-5 text-primary">
                    <CheckCircle2 className="w-6 h-6 fill-primary text-white" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {opt.title}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {opt.badge}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Included Dashboard Features
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.features.map((feat, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={handleFinish}
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-primary/30 transition-all inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
