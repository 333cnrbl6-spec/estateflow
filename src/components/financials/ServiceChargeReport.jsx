import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export default function ServiceChargeReport({ transactions = [], properties = [] }) {
  // Calculate service charge collection by property
  const propertyStats = {};
  
  properties.forEach(p => {
    propertyStats[p.id] = {
      name: p.name,
      collected: 0,
      outstanding: 0,
      arrears: 0
    };
  });

  transactions.forEach(t => {
    if (t.transaction_type !== 'service_charge' || !t.property_id) return;
    
    if (!propertyStats[t.property_id]) {
      propertyStats[t.property_id] = {
        name: `Property ${t.property_id}`,
        collected: 0,
        outstanding: 0,
        arrears: 0
      };
    }

    const amount = t.amount || 0;
    if (t.status === 'paid') {
      propertyStats[t.property_id].collected += amount;
    } else if (t.status === 'overdue') {
      propertyStats[t.property_id].arrears += amount;
    } else if (t.status === 'pending' || t.status === 'partial') {
      propertyStats[t.property_id].outstanding += amount;
    }
  });

  const chartData = Object.values(propertyStats)
    .filter(p => p.collected > 0 || p.outstanding > 0 || p.arrears > 0)
    .sort((a, b) => (b.collected + b.outstanding + b.arrears) - (a.collected + a.outstanding + a.arrears));

  const totalCollected = chartData.reduce((sum, p) => sum + p.collected, 0);
  const totalOutstanding = chartData.reduce((sum, p) => sum + p.outstanding, 0);
  const totalArrears = chartData.reduce((sum, p) => sum + p.arrears, 0);
  const totalBilled = totalCollected + totalOutstanding + totalArrears;
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Charge Collection Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-600 mb-1">Collected</p>
            <p className="text-xl font-bold text-green-900">£{totalCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-xs text-amber-600 mb-1">Outstanding</p>
            <p className="text-xl font-bold text-amber-900">£{totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs text-red-600 mb-1">Arrears</p>
            <p className="text-xl font-bold text-red-900">£{totalArrears.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-600 mb-1">Collection Rate</p>
            <p className="text-xl font-bold text-blue-900">{collectionRate}%</p>
          </div>
        </div>

        {totalArrears > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-900">Outstanding Arrears</p>
              <p className="text-red-700">£{totalArrears.toLocaleString(undefined, { maximumFractionDigits: 0 })} across {chartData.filter(p => p.arrears > 0).length} properties</p>
            </div>
          </div>
        )}

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
              <Legend />
              <Bar dataKey="collected" fill="#16a34a" name="Collected" />
              <Bar dataKey="outstanding" fill="#f59e0b" name="Outstanding" />
              <Bar dataKey="arrears" fill="#dc2626" name="Arrears" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8">No service charge data available</p>
        )}

        {chartData.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-3">Property Breakdown</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chartData.map((prop, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 border border-border rounded-lg">
                  <span className="font-medium">{prop.name}</span>
                  <div className="flex gap-3">
                    <span className="text-green-700">Collected: £{prop.collected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    {prop.outstanding > 0 && <span className="text-amber-700">Outstanding: £{prop.outstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>}
                    {prop.arrears > 0 && <span className="text-red-700">Arrears: £{prop.arrears.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}