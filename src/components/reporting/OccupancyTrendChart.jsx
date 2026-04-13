import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OccupancyTrendChart({ tenants, units }) {
  const data = useMemo(() => {
    if (units.length === 0) return [];

    // Group tenants by creation month
    const monthlyOccupancy = {};
    
    tenants.forEach(t => {
      const date = new Date(t.created_date || t.tenancy_start_date);
      const key = date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      
      if (!monthlyOccupancy[key]) {
        monthlyOccupancy[key] = { month: key, occupied: 0, total: units.length };
      }
      
      if (t.status !== 'ended' && t.status !== 'terminated') {
        monthlyOccupancy[key].occupied += 1;
      }
    });

    return Object.values(monthlyOccupancy)
      .map(m => ({ ...m, rate: ((m.occupied / m.total) * 100).toFixed(1) }))
      .slice(-6);
  }, [tenants, units]);

  const occupancyRate = units.length > 0
    ? ((tenants.filter(t => t.status !== 'ended' && t.status !== 'terminated').length / units.length) * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Trend</CardTitle>
        <CardDescription>Current occupancy rate: {occupancyRate}%</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis domain={[0, 100]} label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} name="Occupancy %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}