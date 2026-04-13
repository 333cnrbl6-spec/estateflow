import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { months_back = 3 } = await req.json();
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months_back, 1);

    // Fetch all data in parallel
    const [properties, units, tenants, transactions, maintenance, docs] = await Promise.all([
      base44.asServiceRole.entities.Property.list('name', 500),
      base44.asServiceRole.entities.Unit.list('-property_id', 500),
      base44.asServiceRole.entities.Tenant.list('-created_date', 500),
      base44.asServiceRole.entities.FinancialTransaction.list('-created_date', 1000),
      base44.asServiceRole.entities.MaintenanceOrder.list('-created_date', 500),
      base44.asServiceRole.entities.Document.list('-created_date', 1000),
    ]);

    // Filter data within date range
    const recentTxns = transactions.filter(t => new Date(t.created_date) >= startDate);
    const recentMaintenance = maintenance.filter(m => new Date(m.created_date) >= startDate);
    const recentDocs = docs.filter(d => new Date(d.created_date) >= startDate);

    // 1. PROPERTY PERFORMANCE
    const propertyStats = properties.map(p => {
      const propUnits = units.filter(u => u.property_id === p.id);
      const propTenants = tenants.filter(t => t.property_id === p.id && t.status === 'active');
      const occupancy = propUnits.length > 0 ? (propTenants.length / propUnits.length * 100).toFixed(1) : 0;

      const propIncome = recentTxns
        .filter(t => t.property_id === p.id && t.direction === 'income')
        .reduce((s, t) => s + (t.amount || 0), 0);

      const propExpenses = recentTxns
        .filter(t => t.property_id === p.id && t.direction === 'expense')
        .reduce((s, t) => s + (t.amount || 0), 0);

      return {
        property_name: p.name,
        property_id: p.id,
        total_units: propUnits.length,
        occupied_units: propTenants.length,
        occupancy_rate: parseFloat(occupancy),
        rental_income: propIncome,
        expenses: propExpenses,
        net_return: propIncome - propExpenses,
      };
    });

    // 2. MAINTENANCE COSTS BREAKDOWN
    const maintenanceByCategory = {};
    const maintenanceByProperty = {};
    for (const m of recentMaintenance) {
      const cat = m.category || 'other';
      const cost = m.actual_cost || m.estimated_cost || 0;
      maintenanceByCategory[cat] = (maintenanceByCategory[cat] || 0) + cost;
      maintenanceByProperty[m.property_id] = (maintenanceByProperty[m.property_id] || 0) + cost;
    }

    // 3. TENANT ARREARS
    const arrearsData = tenants
      .filter(t => t.status === 'in_arrears')
      .map(t => {
        const owedTxns = recentTxns.filter(tx => tx.tenant_id === t.id && tx.status === 'overdue');
        const totalArrears = owedTxns.reduce((s, tx) => s + (tx.amount || 0), 0);
        return {
          tenant_name: t.full_name,
          tenant_id: t.id,
          property_id: t.property_id,
          total_arrears: totalArrears,
          oldest_arrears_date: owedTxns.length > 0
            ? owedTxns.reduce((min, tx) => tx.created_date < min ? tx.created_date : min, owedTxns[0].created_date)
            : null,
          arrears_count: owedTxns.length,
        };
      })
      .sort((a, b) => b.total_arrears - a.total_arrears);

    const totalArrears = arrearsData.reduce((s, a) => s + a.total_arrears, 0);
    const averageArrears = arrearsData.length > 0 ? (totalArrears / arrearsData.length).toFixed(2) : 0;

    // 4. COMPLIANCE STATUS
    const complianceTypes = ['gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert', 'asbestos_report'];
    const complianceStatus = {};
    for (const type of complianceTypes) {
      const propertiesWithType = new Set();
      const propertiesWithValid = new Set();
      for (const doc of recentDocs.filter(d => d.document_type === type)) {
        if (doc.property_id) propertiesWithType.add(doc.property_id);
        if (doc.expiry_date && new Date(doc.expiry_date) > today) {
          propertiesWithValid.add(doc.property_id);
        }
      }
      complianceStatus[type] = {
        properties_with_doc: propertiesWithType.size,
        properties_with_valid: propertiesWithValid.size,
        coverage_percent: properties.length > 0 ? (propertiesWithValid.size / properties.length * 100).toFixed(1) : 0,
      };
    }

    // Build LLM context for insights
    const reportContext = {
      period: `Last ${months_back} months (from ${startDate.toISOString().split('T')[0]})`,
      total_properties: properties.length,
      total_units: units.length,
      active_tenants: tenants.filter(t => t.status === 'active').length,
      properties_in_arrears: arrearsData.length,
      total_arrears,
      total_rental_income: recentTxns.filter(t => t.direction === 'income').reduce((s, t) => s + (t.amount || 0), 0),
      total_expenses: recentTxns.filter(t => t.direction === 'expense').reduce((s, t) => s + (t.amount || 0), 0),
      maintenance_orders: recentMaintenance.length,
      completed_maintenance: recentMaintenance.filter(m => m.status === 'completed').length,
      property_stats: propertyStats,
      maintenance_by_category: maintenanceByCategory,
      arrears_overview: arrearsData.slice(0, 5),
    };

    // Use LLM to generate insights
    const insightPrompt = `You are a property management AI analyst. Analyze this landlord portfolio data and provide 3-5 key insights and recommendations:

${JSON.stringify(reportContext, null, 2)}

Provide insights covering:
- Portfolio health (occupancy, income stability)
- Maintenance trends and cost control
- Arrears management and tenant risks
- Compliance gaps

Keep each insight to 1-2 sentences. Format as a JSON array with "insight" and "priority" (high/medium/low) fields.`;

    const insightResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: insightPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                insight: { type: 'string' },
                priority: { type: 'string' },
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      period: `Last ${months_back} months`,
      generated_date: today.toISOString(),
      property_performance: propertyStats,
      maintenance_breakdown: {
        by_category: maintenanceByCategory,
        by_property: maintenanceByProperty,
        total_spent: Object.values(maintenanceByCategory).reduce((s, v) => s + v, 0),
      },
      arrears: {
        total_arrears: parseFloat(totalArrears.toFixed(2)),
        average_arrears: parseFloat(averageArrears),
        tenants_in_arrears: arrearsData.length,
        top_arrears: arrearsData.slice(0, 5),
      },
      compliance: complianceStatus,
      insights: insightResult?.insights || [],
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});