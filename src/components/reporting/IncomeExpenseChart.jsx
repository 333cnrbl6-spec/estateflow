import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function IncomeExpenseChart({ transactions, month }) {
  const data = useMemo(() => {
    const [year, monthNum] = month.split('-');
    const monthStart = new Date(year, parseInt(monthNum) - 1, 1);
    const monthEnd = new Date(year, parseInt(monthNum), 0);

    const weekly = [];
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 7)) {
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTransactions = transactions.filter(t => {
        const tDate = new Date(t.created_date);
        return tDate >= d && tDate <= weekEnd;
      });

      const income = weekTransactions
        .filter(t => t.type === 'income' || t.type === 'rent_received')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expenses = weekTransactions
        .filter(t => t.type === 'expense' || t.type === 'service_charge')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      weekly.push({
        week: `${d.getDate()}-${Math.min(weekEnd.getDate(), monthEnd.getDate())} ${new Date(month).toLocaleDateString('en-GB', { month: 'short' })}`,
        income,
        expenses,
      });
    }

    return weekly;
  }, [transactions, month]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Weekly breakdown of income and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" fontSize={12} />
            <YAxis />
            <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}