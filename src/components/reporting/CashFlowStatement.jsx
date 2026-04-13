import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CashFlowStatement({ data, month }) {
  if (!data) return null;

  const formatCurrency = (value) => `£${(value / 1000).toFixed(1)}k`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="inflows" fill="#10b981" />
              <Bar dataKey="outflows" fill="#ef4444" />
              <Bar dataKey="netFlow" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Inflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{data.summary.totalInflows.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rent & income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Outflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              £{data.summary.totalOutflows.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.summary.netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              £{data.summary.netCashFlow.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inflows - Outflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cash Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.summary.totalInflows / data.summary.totalOutflows) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Income vs expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm">{item.category}</span>
                <span className={`font-semibold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{item.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}