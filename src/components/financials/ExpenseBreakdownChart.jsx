import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function ExpenseBreakdownChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown (Total: £{total.toLocaleString('en-GB', { maximumFractionDigits: 0 })})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {data.map((item, index) => (
            <div key={item.name} className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
              </div>
              <p className="text-lg font-semibold">£{item.value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground">{((item.value / total) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: £${(value / 1000).toFixed(0)}k`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}