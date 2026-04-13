import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PropertyProfitLoss({ data, month }) {
  if (!data) return null;

  const sortedProperties = [...data.properties].sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-4">
      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{data.summary.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              £{data.summary.totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              £{data.summary.netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profit margin: {data.summary.profitMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Revenue vs Expenses by Property</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedProperties}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sortedProperties}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Property Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detailed P&L by Property</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Property</th>
                  <th className="text-right py-2 px-3">Revenue</th>
                  <th className="text-right py-2 px-3">Expenses</th>
                  <th className="text-right py-2 px-3">Profit</th>
                  <th className="text-right py-2 px-3">Margin</th>
                </tr>
              </thead>
              <tbody>
                {sortedProperties.map((prop) => (
                  <tr key={prop.id} className="border-b hover:bg-muted">
                    <td className="py-2 px-3 font-medium">{prop.name}</td>
                    <td className="text-right py-2 px-3 text-green-600">£{prop.revenue.toFixed(2)}</td>
                    <td className="text-right py-2 px-3 text-red-600">£{prop.expenses.toFixed(2)}</td>
                    <td className={`text-right py-2 px-3 font-semibold ${prop.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      £{prop.profit.toFixed(2)}
                    </td>
                    <td className="text-right py-2 px-3">{prop.margin.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}