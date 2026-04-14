import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { property_id, year, month } = body;

    if (!property_id || !year || !month) {
      return Response.json({ error: 'property_id, year, month required' }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get financial data for the month
    const transactions = await base44.entities.FinancialTransaction.filter({
      property_id
    });

    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.created_date);
      return tDate >= startDate && tDate <= endDate;
    });

    const income = monthTransactions
      .filter(t => t.direction === 'income' && t.status === 'paid')
      .reduce((s, t) => s + (t.amount || 0), 0);

    const expenses = monthTransactions
      .filter(t => t.direction === 'expense' && t.status === 'paid')
      .reduce((s, t) => s + (t.amount || 0), 0);

    const overdue = monthTransactions
      .filter(t => t.status === 'overdue')
      .reduce((s, t) => s + (t.amount || 0), 0);

    const property = await base44.entities.Property.filter({ id: property_id });
    const tenants = await base44.entities.Tenant.filter({ property_id });
    const maintenance = await base44.entities.MaintenanceRequest.filter({ property_id });

    const monthMaintenance = maintenance.filter(m => {
      const mDate = new Date(m.created_date);
      return mDate >= startDate && mDate <= endDate;
    });

    return Response.json({
      generatedAt: new Date().toISOString(),
      period: `${year}-${String(month).padStart(2, '0')}`,
      property: property[0] || {},
      financials: {
        income,
        expenses,
        profit: income - expenses,
        overdue,
        transactions: monthTransactions.length
      },
      tenancy: {
        activeTenants: tenants.filter(t => t.status === 'active').length,
        inArrears: tenants.filter(t => t.status === 'in_arrears').length,
        totalTenants: tenants.length
      },
      maintenance: {
        requestsRaised: monthMaintenance.length,
        completed: monthMaintenance.filter(m => m.status === 'completed').length,
        inProgress: monthMaintenance.filter(m => m.status === 'in_progress').length,
        totalCost: monthMaintenance.reduce((s, m) => s + (m.actual_cost || 0), 0)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});