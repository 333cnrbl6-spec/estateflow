import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

export default function MonthlyStatement({ transactions = [] }) {
  // Group transactions by month
  const monthlyData = {};
  transactions.forEach(t => {
    if (!t.paid_date && !t.due_date) return;
    const date = parseISO(t.paid_date || t.due_date);
    const monthKey = format(date, 'yyyy-MM');
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: format(date, 'MMM yyyy'), income: 0, expenses: 0 };
    }
    const amount = t.amount || 0;
    if (t.direction === 'income' && t.status === 'paid') {
      monthlyData[monthKey].income += amount;
    } else if (t.direction === 'expense' && t.status === 'paid') {
      monthlyData[monthKey].expenses += amount;
    }
  });

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

  // Calculate totals
  const totalIncome = chartData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = chartData.reduce((sum, m) => sum + m.expenses, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Income & Expenditure Statement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-900">£{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs text-red-600 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-900">£{totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className={`rounded-lg p-4 border ${netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className={`text-xs mb-1 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              £{Math.abs(netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
              <Legend />
              <Bar dataKey="income" fill="#16a34a" name="Income" />
              <Bar dataKey="expenses" fill="#dc2626" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8">No transaction data available</p>
        )}
      </CardContent>
    </Card>
  );
}