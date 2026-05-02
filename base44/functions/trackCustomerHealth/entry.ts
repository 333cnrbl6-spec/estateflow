import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Run daily health check for all users
    const users = await base44.asServiceRole.entities.User.list('-updated_date', 10000);
    const today = new Date().toISOString().split('T')[0];

    for (const user of users) {
      if (!user.email) continue;

      const [properties, maintenance, transactions] = await Promise.all([
        base44.asServiceRole.entities.Property.filter({ owning_company: '' }, '-updated_date', 100),
        base44.asServiceRole.entities.MaintenanceOrder?.list?.('-updated_date', 100).catch(() => []) || [],
        base44.asServiceRole.entities.FinancialTransaction?.list?.('-updated_date', 100).catch(() => []) || []
      ]);

      // Calculate days since last activity
      const lastUpdates = [
        user.updated_date,
        ...(properties.map(p => p.updated_date) || []),
        ...(maintenance.map(m => m.updated_date) || []),
        ...(transactions.map(t => t.updated_date) || [])
      ];

      const lastActivity = lastUpdates.length > 0 
        ? new Date(lastUpdates.sort().reverse()[0])
        : new Date(user.created_date);
      
      const daysInactive = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      // Churn risk: inactive 30+ days = high risk
      const churnRisk = daysInactive > 30 ? Math.min(100, 50 + (daysInactive - 30) * 2) : 0;

      // Record metric
      await base44.asServiceRole.entities.UsageMetric.create({
        user_id: user.id,
        metric_date: today,
        properties_count: properties.length || 0,
        tenants_count: 0,
        maintenance_orders: maintenance.length || 0,
        api_calls: 0,
        days_inactive: daysInactive,
        churn_risk_score: churnRisk
      });
    }

    return Response.json({ message: `Health check completed for ${users.length} users` });
  } catch (error) {
    console.error('Customer health tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});