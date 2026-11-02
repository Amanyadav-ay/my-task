import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20',
    success: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-card-darkBg border border-slate-200/80 dark:border-card-darkBorder shadow-card hover:shadow-cardHover transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.primary}`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
        {trend && (
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
