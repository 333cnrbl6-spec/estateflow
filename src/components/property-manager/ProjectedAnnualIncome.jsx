import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProjectedAnnualIncome() {
  const [projection, setProjection] = useState({
    totalAnnual: 0,
    monthlyAverage: 0,
    activeContracts: 0,
    avgRentPerUnit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjection();
  }, []);

  const loadProjection = async () => {
    try {
      const tenants = await base44.entities.Tenant.list();
      const transactions = await base44.entities.FinancialTransaction.list();
      const units = await base44.entities.Unit.list();

      let monthlyRent = 0;
      let activeContracts = 0;
      const rentsByUnit = {};

      if (tenants) {
        tenants.forEach(tenant => {
          if (tenant.status === 'active') {
            activeContracts++;
            monthlyRent += 1200; // Default monthly rent assumption
          }
        });
      }

      // Calculate average from actual transactions
      let totalCollected = 0;
      let rentPaymentCount = 0;

      if (transactions) {
        transactions.forEach(tx => {
          if (tx.type === 'rent_payment' && tx.amount) {
            totalCollected += tx.amount / 100;
            rentPaymentCount++;
          }
        });
      }

      // Use actual average if available
      if (rentPaymentCount > 0) {
        monthlyRent = totalCollected / Math.ceil(rentPaymentCount / 12);
      }

      const totalAnnual = monthlyRent * 12;
      const avgRentPerUnit = activeContracts > 0 ? monthlyRent / activeContracts : 0;

      setProjection({
        totalAnnual: parseFloat(totalAnnual.toFixed(2)),
        monthlyAverage: parseFloat(monthlyRent.toFixed(2)),
        activeContracts,
        avgRentPerUnit: parseFloat(avgRentPerUnit.toFixed(2))
      });
    } catch (err) {
      console.error('Error loading projection:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card><CardContent className="py-6 text-center text-muted-foreground">Loading...</CardContent></Card>;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Projected Annual Income
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Annual Projection</p>
          <div className="text-4xl font-bold text-green-600">£{projection.totalAnnual.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground mt-1">Based on active rental contracts</p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Monthly Average</p>
            <p className="font-semibold">£{projection.monthlyAverage.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Active Contracts</p>
            <p className="font-semibold">{projection.activeContracts}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Avg Per Unit</p>
            <p className="font-semibold">£{projection.avgRentPerUnit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}