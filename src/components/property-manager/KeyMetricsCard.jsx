import React from 'react';

const COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-600' },
  { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', icon: 'text-orange-600' },
  { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', icon: 'text-green-600' },
  { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', icon: 'text-purple-600' },
  { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', icon: 'text-red-600' },
];

export default function KeyMetricsCard({ title, value, subtitle, icon: Icon, colorIndex = 0 }) {
  const color = COLORS[colorIndex % COLORS.length];

  return (
    <div className={`${color.bg} rounded-lg border border-current border-opacity-20 p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${color.text} opacity-75`}>{title}</p>
          <p className={`text-3xl font-bold ${color.text} mt-2`}>{value}</p>
          <p className={`text-xs ${color.text} opacity-60 mt-2`}>{subtitle}</p>
        </div>
        <Icon className={`w-8 h-8 ${color.icon} opacity-20`} />
      </div>
    </div>
  );
}