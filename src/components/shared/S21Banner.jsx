import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { differenceInDays, parseISO, isPast } from 'date-fns';

const S21_DATE = parseISO('2026-05-01');

export default function S21Banner({ compact = false }) {
  const today = new Date();

  // Only show while S21 is still in effect
  if (isPast(S21_DATE)) return null;

  const daysLeft = differenceInDays(S21_DATE, today);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
        <Scale className="w-4 h-4 text-red-600 shrink-0" />
        <span className="text-red-800 font-semibold">S21 abolished in {daysLeft} days (1 May 2026)</span>
        <span className="text-red-700 text-xs hidden sm:inline">· Last valid notice: 30 Apr 2026 · All ASTs become periodic</span>
        <Link to="/regulatory-hub" className="ml-auto shrink-0 text-xs font-medium text-red-700 hover:underline whitespace-nowrap">
          Learn more →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
      <Scale className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-900">
          Renters' Rights Act 2025 — Section 21 abolished in <span className="tabular-nums">{daysLeft}</span> days
        </p>
        <p className="text-xs text-red-700 mt-1 leading-relaxed">
          Last valid S21 notice: <strong>30 April 2026</strong>.
          After 1 May 2026 all ASTs automatically convert to periodic tenancies.
          Possession will only be possible via <strong>Section 8</strong> grounds.
          Civil penalty up to <strong>£7,000</strong> for serving an invalid S21.
          Tenant information sheet required by 31 May 2026.
        </p>
      </div>
      <Link
        to="/regulatory-hub"
        className="shrink-0 text-xs font-semibold text-red-700 hover:underline whitespace-nowrap border border-red-300 rounded px-2 py-1 bg-red-100 hover:bg-red-200 transition-colors"
      >
        Regulatory Hub →
      </Link>
    </div>
  );
}