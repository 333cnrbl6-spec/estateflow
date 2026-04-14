import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(173,58%,39%)', 'hsl(0,72%,51%)', 'hsl(220,15%,93%)'];

export default function OccupancyOverviewCard({ units }) {
  const data = [
    { name: 'Occupied', value: units.filter(u => u.status === 'occupied').length },
    { name: 'Vacant', value: units.filter(u => u.status === 'vacant').length },
    { name: 'Maintenance', value: units.filter(u => u.status === 'maintenance').length },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Unit Occupancy Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} units`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <p className="font-semibold text-foreground">{d.value}</p>
            <p className="text-muted-foreground">{d.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}