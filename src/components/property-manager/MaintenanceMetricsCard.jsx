import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MaintenanceMetricsCard({ byPriority }) {
  const data = [
    { priority: 'Low', count: byPriority.low || 0 },
    { priority: 'Standard', count: byPriority.standard || 0 },
    { priority: 'Urgent', count: byPriority.urgent || 0 },
    { priority: 'Emergency', count: byPriority.emergency || 0 },
  ].filter(d => d.count > 0);

  const total = Object.values(byPriority).reduce((sum, v) => sum + (v || 0), 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance by Priority</h3>
      {total === 0 ? (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          No pending maintenance requests
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,89%)" />
            <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(12,76%,61%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">Total Pending: <span className="font-semibold text-foreground">{total}</span></p>
      </div>
    </div>
  );
}