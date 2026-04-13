import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MonthlyRevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Rental Income (12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Rental Income (12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip 
              formatter={(value) => `£${(value || 0).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`}
            />
            <Legend />
            <Bar dataKey="expected" fill="#3b82f6" name="Expected Income" />
            <Bar dataKey="received" fill="#10b981" name="Received Income" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}