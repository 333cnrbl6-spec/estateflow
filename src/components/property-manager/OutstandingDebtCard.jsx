import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OutstandingDebtCard() {
  const [debtData, setDebtData] = useState({ total: 0, properties: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebtData();
  }, []);

  const loadDebtData = async () => {
    try {
      const tenants = await base44.entities.Tenant.list();
      const properties = await base44.entities.Property.list();
      const rentLedgers = await base44.entities.RentLedger.list();

      let totalDebt = 0;
      const propertyDebt = {};

      if (rentLedgers) {
        rentLedgers.forEach(ledger => {
          if (ledger.arrears_amount && ledger.arrears_amount > 0) {
            totalDebt += ledger.arrears_amount / 100; // Convert pence to pounds
            if (!propertyDebt[ledger.property_id]) {
              propertyDebt[ledger.property_id] = 0;
            }
            propertyDebt[ledger.property_id] += ledger.arrears_amount / 100;
          }
        });
      }

      // Also count in_arrears tenants
      if (tenants) {
        const arrearrsTenants = tenants.filter(t => t.status === 'in_arrears');
        arrearrsTenants.forEach(tenant => {
          if (tenant.unit_id && properties) {
            const prop = properties.find(p => p.id === tenant.property_id);
            if (prop && !propertyDebt[prop.id]) {
              propertyDebt[prop.id] = 0;
            }
          }
        });
      }

      const debtByProperty = Object.entries(propertyDebt)
        .map(([propId, amount]) => {
          const prop = properties?.find(p => p.id === propId);
          return { propertyName: prop?.name || 'Unknown', amount };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setDebtData({ total: totalDebt, properties: debtByProperty });
    } catch (err) {
      console.error('Error loading debt data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card><CardContent className="py-6 text-center text-muted-foreground">Loading...</CardContent></Card>;

  return (
    <Card className={debtData.total > 0 ? 'border-red-200 bg-red-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Outstanding Debt
          {debtData.total > 0 && <AlertTriangle className="w-5 h-5 text-red-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-red-600">£{debtData.total.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {debtData.properties.length} properties with arrears
          </p>
        </div>

        {debtData.properties.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Top arrears by property:</p>
            {debtData.properties.map((prop, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{prop.propertyName}</span>
                <Badge variant="destructive">£{prop.amount.toFixed(2)}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}