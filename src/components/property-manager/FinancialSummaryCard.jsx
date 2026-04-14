import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FinancialSummaryCard({ monthlyTrend }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Income & Expense Trend (12 Months)</h3>
      {monthlyTrend.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          No financial data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,89%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => `£${value.toLocaleString()}`}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="hsl(173,58%,39%)" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="hsl(0,72%,51%)" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}