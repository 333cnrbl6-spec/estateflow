import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (n) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function PropertyIncomeTable({ transactions, properties }) {
  const propMap = properties.reduce((m, p) => { m[p.id] = p; return m; }, {});

  const byProperty = {};
  transactions.forEach(t => {
    const key = t.property_id || '__none__';
    if (!byProperty[key]) {
      byProperty[key] = { name: propMap[key]?.name || 'Unassigned', income: 0, expenses: 0, pending: 0 };
    }
    const amount = t.amount || 0;
    if (t.direction === 'income' && t.status === 'paid') byProperty[key].income += amount;
    if (t.direction === 'expense' && t.status === 'paid') byProperty[key].expenses += amount;
    if (t.direction === 'expense' && (t.status === 'pending' || t.status === 'overdue')) byProperty[key].pending += amount;
  });

  const rows = Object.values(byProperty).filter(r => r.income + r.expenses + r.pending > 0);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income & Expenses by Property</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Property</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Income</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Expenses</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Pending</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Net</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">P&L</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const net = row.income - row.expenses;
                const profitable = net >= 0;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{row.name}</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-medium">{fmt(row.income)}</td>
                    <td className="py-3 px-4 text-right text-red-700 font-medium">{fmt(row.expenses)}</td>
                    <td className="py-3 px-4 text-right text-amber-700">{row.pending > 0 ? fmt(row.pending) : '—'}</td>
                    <td className={`py-3 px-4 text-right font-bold ${profitable ? 'text-emerald-700' : 'text-red-700'}`}>
                      {fmt(net)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {profitable
                        ? <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/40 font-bold">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right text-emerald-700">{fmt(rows.reduce((s, r) => s + r.income, 0))}</td>
                <td className="py-3 px-4 text-right text-red-700">{fmt(rows.reduce((s, r) => s + r.expenses, 0))}</td>
                <td className="py-3 px-4 text-right text-amber-700">{fmt(rows.reduce((s, r) => s + r.pending, 0))}</td>
                <td className="py-3 px-4 text-right">
                  {fmt(rows.reduce((s, r) => s + r.income - r.expenses, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}