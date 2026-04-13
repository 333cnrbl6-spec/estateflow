import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Download, Loader2 } from 'lucide-react';

export default function PropertyPerformanceChart({ propertyId = null, months = 12 }) {
  const [period, setPeriod] = useState(months);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['property-performance', propertyId, period],
    queryFn: async () => {
      const result = await base44.functions.invoke('generatePropertyPerformanceSummary', {
        property_id: propertyId,
        months: period,
      });
      return result.data;
    },
  });

  const handleExport = () => {
    if (!data?.summary) return;
    const csv = [
      ['Month', 'Income', 'Expenditure', 'Net Profit'],
      ...data.summary.map(m => [
        m.month,
        m.income.toFixed(2),
        m.expenditure.toFixed(2),
        (m.income - m.expenditure).toFixed(2),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-performance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Property Performance
            </CardTitle>
            <div className="flex gap-2">
              <select
                value={period}
                onChange={e => setPeriod(parseInt(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={3}>Last 3 months</option>
                <option value={6}>Last 6 months</option>
                <option value={12}>Last 12 months</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={!data?.summary || isLoading}
                className="gap-1"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>Failed to load data</p>
            </div>
          ) : data?.summary ? (
            <div className="space-y-6">
              {/* Totals Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Income</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    £{(data.totals.totalIncome / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Expenditure</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">
                    £{(data.totals.totalExpenditure / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`border rounded-lg p-4 ${
                  data.totals.netProfit >= 0
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Profit</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    data.totals.netProfit >= 0 ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    £{(data.totals.netProfit / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.summary} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                      formatter={(value) => `£${(value / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenditure" fill="#ef4444" name="Expenditure" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="text-left px-4 py-2">Month</th>
                      <th className="text-right px-4 py-2">Income</th>
                      <th className="text-right px-4 py-2">Expenditure</th>
                      <th className="text-right px-4 py-2">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.summary.map((month) => (
                      <tr key={month.month} className="hover:bg-muted/50">
                        <td className="px-4 py-2 font-medium">{month.month}</td>
                        <td className="text-right px-4 py-2 text-green-700 font-semibold">
                          £{(month.income / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right px-4 py-2 text-red-700 font-semibold">
                          £{(month.expenditure / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`text-right px-4 py-2 font-semibold ${
                          (month.income - month.expenditure) >= 0
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}>
                          £{((month.income - month.expenditure) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {data.transactionCount} transactions analyzed over {data.periodMonths} months
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}