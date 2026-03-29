import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';

const fmt = (n) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function PendingExpensesPanel({ transactions, propMap }) {
  const pending = transactions.filter(t =>
    t.direction === 'expense' && (t.status === 'pending' || t.status === 'overdue')
  );

  const totalPending = pending.reduce((s, t) => s + (t.amount || 0), 0);
  const overdue = pending.filter(t => t.status === 'overdue' || (t.due_date && isPast(parseISO(t.due_date))));
  const upcoming = pending.filter(t => t.status === 'pending' && (!t.due_date || !isPast(parseISO(t.due_date))));

  if (pending.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Pending & Overdue Expenses
          </div>
          <span className="text-base font-bold text-amber-900">{fmt(totalPending)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {overdue.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Overdue ({overdue.length})
            </p>
            {overdue.map((t, i) => {
              const daysLate = t.due_date ? differenceInDays(new Date(), parseISO(t.due_date)) : null;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-900">{t.description || t.transaction_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-red-600">
                      {propMap[t.property_id]?.name || 'Portfolio'}
                      {daysLate !== null && ` · ${daysLate}d overdue`}
                    </p>
                  </div>
                  <span className="font-bold text-red-800">{fmt(t.amount)}</span>
                </div>
              );
            })}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Upcoming ({upcoming.length})
            </p>
            {upcoming.map((t, i) => {
              const daysUntil = t.due_date ? differenceInDays(parseISO(t.due_date), new Date()) : null;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-amber-900">{t.description || t.transaction_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-amber-600">
                      {propMap[t.property_id]?.name || 'Portfolio'}
                      {t.due_date && ` · Due ${format(parseISO(t.due_date), 'dd MMM yyyy')}`}
                      {daysUntil !== null && daysUntil <= 30 && ` (${daysUntil}d)`}
                    </p>
                  </div>
                  <span className="font-bold text-amber-800">{fmt(t.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}