import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      propertyIds = [],
      metrics = [],
      start_date,
      end_date
    } = await req.json();

    const reportData = {};

    // Fetch transactions for selected properties
    for (const propId of propertyIds) {
      const transactions = await base44.asServiceRole.entities.FinancialTransaction.filter({
        property_id: propId,
        created_date: { $gte: start_date, $lte: end_date }
      });

      reportData[propId] = {
        propertyId: propId,
        metrics: {}
      };

      // Calculate requested metrics
      for (const metric of metrics) {
        if (metric === 'total_income') {
          reportData[propId].metrics.total_income = transactions
            .filter(t => t.transaction_type === 'rent_payment' || t.transaction_type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        } else if (metric === 'total_expenses') {
          reportData[propId].metrics.total_expenses = transactions
            .filter(t => t.transaction_type === 'expense' || t.transaction_type === 'maintenance')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        } else if (metric === 'arrears') {
          reportData[propId].metrics.arrears = transactions
            .filter(t => t.transaction_type === 'arrears')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        } else if (metric === 'maintenance_cost') {
          reportData[propId].metrics.maintenance_cost = transactions
            .filter(t => t.transaction_type === 'maintenance')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        } else if (metric === 'occupancy_rate') {
          const units = await base44.asServiceRole.entities.Unit.filter({ property_id: propId });
          const occupiedUnits = units.filter(u => u.status === 'occupied').length;
          reportData[propId].metrics.occupancy_rate = units.length > 0 
            ? (occupiedUnits / units.length) * 100 
            : 0;
        } else if (metric === 'yield') {
          const incomeVal = transactions
            .filter(t => t.transaction_type === 'rent_payment')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
          const propData = await base44.asServiceRole.entities.Property.get(propId);
          reportData[propId].metrics.yield = propData.estimated_value 
            ? ((incomeVal / propData.estimated_value) * 100 / 12).toFixed(2)
            : 0;
        }
      }
    }

    console.log(`[Report] Generated custom report for ${propertyIds.length} properties`);

    return Response.json({
      success: true,
      reportData,
      period: { start_date, end_date },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Report] Custom report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});