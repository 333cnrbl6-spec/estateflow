import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { base44 } from '@/api/base44Client';

export default function RentCollectionTrendsChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
  }, []);

  const loadTrendData = async () => {
    try {
      const transactions = await base44.entities.FinancialTransaction.list();
      
      // Group by month
      const monthlyData = {};
      const today = new Date();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = { month: monthKey, collected: 0, expected: 0 };
      }

      // Process transactions
      if (transactions) {
        transactions.forEach(tx => {
          if (tx.type === 'rent_payment' && tx.transaction_date) {
            const date = new Date(tx.transaction_date);
            const monthKey = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].collected += tx.amount / 100; // Convert pence to pounds
            }
          }
        });
      }

      // Get tenants for expected rent
      const tenants = await base44.entities.Tenant.list();
      if (tenants) {
        tenants.forEach(tenant => {
          // Simple calculation: assume monthly rent based on lease
          for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
            const monthKey = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
            if (monthlyData[monthKey] && tenant.status === 'active') {
              monthlyData[monthKey].expected += 1200; // Default monthly rent
            }
          }
        });
      }

      setChartData(Object.values(monthlyData));
    } catch (err) {
      console.error('Error loading trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading chart...</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Rent Collection Trends (12 Months)
          <span className="text-sm font-normal text-muted-foreground">Last 12 months</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => `£${value.toFixed(0)}`} />
            <Legend />
            <Bar dataKey="collected" fill="#22c55e" name="Collected" />
            <Bar dataKey="expected" fill="#94a3b8" name="Expected" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}