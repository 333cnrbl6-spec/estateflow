import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, AlertTriangle, Hammer, PoundSterling } from 'lucide-react';
import RentCollectionTrendsChart from '@/components/property-manager/RentCollectionTrendsChart';
import OutstandingDebtCard from '@/components/property-manager/OutstandingDebtCard';
import MaintenanceCostByProperty from '@/components/property-manager/MaintenanceCostByProperty';
import ProjectedAnnualIncome from '@/components/property-manager/ProjectedAnnualIncome';
import { base44 } from '@/api/base44Client';

export default function PropertyManagerFinancialDashboard() {
  const [summaryStats, setSummaryStats] = useState({
    totalProperties: 0,
    occupiedUnits: 0,
    occupancyRate: 0,
    totalMaintenance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    try {
      const [properties, units, tenants, maintenanceOrders] = await Promise.all([
        base44.entities.Property.list(),
        base44.entities.Unit.list(),
        base44.entities.Tenant.list(),
        base44.entities.MaintenanceOrder.list()
      ]);

      const totalProperties = properties?.length || 0;
      const totalUnits = units?.length || 0;
      const occupiedUnits = tenants?.filter(t => t.status === 'active').length || 0;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      let totalMaintenance = 0;
      if (maintenanceOrders) {
        maintenanceOrders.forEach(order => {
          if (order.total_cost) {
            totalMaintenance += order.total_cost / 100;
          }
        });
      }

      setSummaryStats({
        totalProperties,
        occupiedUnits,
        occupancyRate,
        totalMaintenance: parseFloat(totalMaintenance.toFixed(2))
      });
    } catch (err) {
      console.error('Error loading summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Property Manager Financial Dashboard</h1>
        <p className="text-muted-foreground">Monitor rent collection, debts, costs, and income projections</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Properties</p>
                <p className="text-3xl font-bold">{summaryStats.totalProperties}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <PoundSterling className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
                <p className="text-3xl font-bold">{summaryStats.occupancyRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{summaryStats.occupiedUnits} occupied units</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Maintenance</p>
                <p className="text-3xl font-bold">£{summaryStats.totalMaintenance.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Hammer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium">All Systems Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts and Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RentCollectionTrendsChart />
          <MaintenanceCostByProperty />
        </div>

        <div className="space-y-6">
          <ProjectedAnnualIncome />
          <OutstandingDebtCard />
        </div>
      </div>
    </div>
  );
}