import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';

export default function MaintenanceCostByProperty() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      const maintenanceOrders = await base44.entities.MaintenanceOrder.list();
      const properties = await base44.entities.Property.list();

      const costByProperty = {};

      if (maintenanceOrders) {
        maintenanceOrders.forEach(order => {
          if (order.total_cost && order.property_id) {
            if (!costByProperty[order.property_id]) {
              costByProperty[order.property_id] = 0;
            }
            costByProperty[order.property_id] += order.total_cost / 100; // Convert pence to pounds
          }
        });
      }

      const chartDataArray = Object.entries(costByProperty)
        .map(([propId, cost]) => {
          const prop = properties?.find(p => p.id === propId);
          return {
            name: prop?.name || 'Unknown',
            cost: parseFloat(cost.toFixed(2))
          };
        })
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10);

      setChartData(chartDataArray);
    } catch (err) {
      console.error('Error loading maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading chart...</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Costs by Property</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No maintenance data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              <Bar dataKey="cost" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}