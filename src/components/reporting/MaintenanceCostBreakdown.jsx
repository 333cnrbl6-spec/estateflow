import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
const CATEGORY_LABELS = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  structural: 'Structural',
  roofing: 'Roofing',
  heating: 'Heating',
  decorating: 'Decorating',
  cleaning: 'Cleaning',
  fire_safety: 'Fire Safety',
  general: 'General',
  other: 'Other',
};

export default function MaintenanceCostBreakdown({ maintenance, month }) {
  const data = useMemo(() => {
    const [year, monthNum] = month.split('-');
    const monthStart = new Date(year, parseInt(monthNum) - 1, 1);
    const monthEnd = new Date(year, parseInt(monthNum), 0);

    const monthlyMaintenance = maintenance.filter(m => {
      const mDate = new Date(m.completion_date || m.created_date);
      return mDate >= monthStart && mDate <= monthEnd;
    });

    const byCategory = {};
    monthlyMaintenance.forEach(m => {
      const cat = m.category || 'other';
      if (!byCategory[cat]) {
        byCategory[cat] = { name: CATEGORY_LABELS[cat] || cat, value: 0, count: 0 };
      }
      byCategory[cat].value += m.actual_cost || m.estimated_cost || 0;
      byCategory[cat].count += 1;
    });

    return Object.values(byCategory).sort((a, b) => b.value - a.value);
  }, [maintenance, month]);

  const totalCost = data.reduce((sum, item) => sum + item.value, 0);
  const totalItems = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Costs by Category</CardTitle>
        <CardDescription>
          Total: £{totalCost.toLocaleString('en-GB', { maximumFractionDigits: 0 })} ({totalItems} items)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No maintenance records for this month</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {data.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.count} item{item.count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold">£{item.value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}