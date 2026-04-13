import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { report_type, property_id, date_from, date_to } = await req.json();

    const query = {};
    if (property_id) query.property_id = property_id;
    
    let maintenanceOrders = await base44.entities.MaintenanceOrder.filter(query);

    // Filter by date range if provided
    if (date_from || date_to) {
      maintenanceOrders = maintenanceOrders.filter(order => {
        const orderDate = new Date(order.created_date);
        if (date_from && orderDate < new Date(date_from)) return false;
        if (date_to && orderDate > new Date(date_to)) return false;
        return true;
      });
    }

    if (report_type === 'recurring_issues') {
      return Response.json(await analyzeRecurringIssues(maintenanceOrders, base44));
    } else if (report_type === 'turnaround_times') {
      return Response.json(await analyzeTurnaroundTimes(maintenanceOrders, base44));
    } else if (report_type === 'contractor_efficiency') {
      return Response.json(await analyzeContractorEfficiency(maintenanceOrders, base44));
    } else if (report_type === 'cost_analysis') {
      return Response.json(await analyzeCosts(maintenanceOrders, base44));
    } else {
      return Response.json({ error: 'Invalid report_type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Maintenance report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function analyzeRecurringIssues(orders, base44) {
  const unitIssues = {};
  const propertyIssues = {};
  const categoryPatterns = {};

  orders.forEach(order => {
    // Track by unit
    if (order.unit_id) {
      if (!unitIssues[order.unit_id]) {
        unitIssues[order.unit_id] = {
          unit_id: order.unit_id,
          property_id: order.property_id,
          total_requests: 0,
          issues: {},
          categories: {},
        };
      }
      unitIssues[order.unit_id].total_requests++;
      
      // Track by description keywords
      const keywords = extractKeywords(order.description);
      keywords.forEach(keyword => {
        unitIssues[order.unit_id].issues[keyword] = (unitIssues[order.unit_id].issues[keyword] || 0) + 1;
      });

      // Track by category
      if (order.category) {
        unitIssues[order.unit_id].categories[order.category] = 
          (unitIssues[order.unit_id].categories[order.category] || 0) + 1;
      }
    }

    // Track by property
    if (order.property_id) {
      if (!propertyIssues[order.property_id]) {
        propertyIssues[order.property_id] = {
          property_id: order.property_id,
          total_requests: 0,
          categories: {},
          priorities: {},
        };
      }
      propertyIssues[order.property_id].total_requests++;
      
      if (order.category) {
        propertyIssues[order.property_id].categories[order.category] = 
          (propertyIssues[order.property_id].categories[order.category] || 0) + 1;
      }
      
      if (order.priority) {
        propertyIssues[order.property_id].priorities[order.priority] = 
          (propertyIssues[order.property_id].priorities[order.priority] || 0) + 1;
      }
    }

    // Track category patterns
    if (order.category) {
      if (!categoryPatterns[order.category]) {
        categoryPatterns[order.category] = {
          category: order.category,
          count: 0,
          avg_cost: 0,
          total_cost: 0,
        };
      }
      categoryPatterns[order.category].count++;
      if (order.actual_cost) {
        categoryPatterns[order.category].total_cost += order.actual_cost;
      }
    }
  });

  // Calculate averages and identify recurring patterns
  const recurringUnitIssues = Object.values(unitIssues)
    .map(unit => {
      const recurringProblems = Object.entries(unit.issues)
        .filter(([_, count]) => count >= 2)
        .map(([issue, count]) => ({ issue, count }));
      
      const topCategories = Object.entries(unit.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([cat, count]) => ({ category: cat, count }));

      return {
        ...unit,
        recurring_problems: recurringProblems,
        top_categories: topCategories,
        has_recurring_issues: recurringProblems.length > 0,
      };
    })
    .filter(unit => unit.has_recurring_issues)
    .sort((a, b) => b.total_requests - a.total_requests);

  const categoryAnalysis = Object.values(categoryPatterns)
    .map(cat => ({
      ...cat,
      avg_cost: cat.count > 0 ? cat.total_cost / cat.count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    report_type: 'recurring_issues',
    generated_date: new Date().toISOString(),
    summary: {
      total_orders_analyzed: orders.length,
      units_with_recurring_issues: recurringUnitIssues.length,
      most_common_category: categoryAnalysis[0]?.category || 'N/A',
    },
    units_with_recurring_issues: recurringUnitIssues.slice(0, 20),
    property_patterns: Object.values(propertyIssues)
      .sort((a, b) => b.total_requests - a.total_requests)
      .slice(0, 10),
    category_analysis: categoryAnalysis,
  };
}

async function analyzeTurnaroundTimes(orders, base44) {
  const completedOrders = orders.filter(o => o.status === 'completed' && o.completed_date);
  
  const turnaroundData = completedOrders.map(order => {
    const reportedDate = new Date(order.created_date);
    const completedDate = new Date(order.completed_date);
    const assignedDate = order.assigned_date ? new Date(order.assigned_date) : null;
    const startedDate = order.started_date ? new Date(order.started_date) : null;

    const totalDays = Math.round((completedDate - reportedDate) / (1000 * 60 * 60 * 24));
    const assignmentDelay = assignedDate ? Math.round((assignedDate - reportedDate) / (1000 * 60 * 60 * 24)) : null;
    const workDuration = startedDate && completedDate ? Math.round((completedDate - startedDate) / (1000 * 60 * 60 * 24)) : null;

    return {
      order_id: order.id,
      property_id: order.property_id,
      unit_id: order.unit_id,
      category: order.category,
      priority: order.priority,
      total_turnaround_days: totalDays,
      assignment_delay_days: assignmentDelay,
      work_duration_days: workDuration,
      reported_date: order.created_date,
      completed_date: order.completed_date,
    };
  });

  // Calculate averages by category
  const byCategory = {};
  turnaroundData.forEach(data => {
    if (!byCategory[data.category]) {
      byCategory[data.category] = {
        category: data.category,
        count: 0,
        total_days: 0,
        min_days: Infinity,
        max_days: 0,
      };
    }
    byCategory[data.category].count++;
    byCategory[data.category].total_days += data.total_turnaround_days;
    byCategory[data.category].min_days = Math.min(byCategory[data.category].min_days, data.total_turnaround_days);
    byCategory[data.category].max_days = Math.max(byCategory[data.category].max_days, data.total_turnaround_days);
  });

  const categoryAverages = Object.values(byCategory)
    .map(cat => ({
      ...cat,
      avg_days: cat.count > 0 ? Math.round(cat.total_days / cat.count * 10) / 10 : 0,
    }))
    .sort((a, b) => a.avg_days - b.avg_days);

  // Calculate averages by priority
  const byPriority = {};
  turnaroundData.forEach(data => {
    if (!byPriority[data.priority]) {
      byPriority[data.priority] = { priority: data.priority, count: 0, total_days: 0 };
    }
    byPriority[data.priority].count++;
    byPriority[data.priority].total_days += data.total_turnaround_days;
  });

  const priorityAverages = Object.values(byPriority)
    .map(p => ({
      ...p,
      avg_days: p.count > 0 ? Math.round(p.total_days / p.count * 10) / 10 : 0,
    }))
    .sort((a, b) => a.avg_days - b.avg_days);

  // Overall statistics
  const totalDaysSum = turnaroundData.reduce((sum, d) => sum + d.total_turnaround_days, 0);
  const overallAvg = turnaroundData.length > 0 ? totalDaysSum / turnaroundData.length : 0;
  const minTurnaround = Math.min(...turnaroundData.map(d => d.total_turnaround_days));
  const maxTurnaround = Math.max(...turnaroundData.map(d => d.total_turnaround_days));

  // Identify slowest and fastest
  const sortedBySpeed = [...turnaroundData].sort((a, b) => a.total_turnaround_days - b.total_turnaround_days);
  const fastest = sortedBySpeed.slice(0, 5);
  const slowest = sortedBySpeed.slice(-5).reverse();

  return {
    report_type: 'turnaround_times',
    generated_date: new Date().toISOString(),
    summary: {
      total_completed_orders: completedOrders.length,
      overall_avg_turnaround_days: Math.round(overallAvg * 10) / 10,
      min_turnaround_days: minTurnaround,
      max_turnaround_days: maxTurnaround,
    },
    average_by_category: categoryAverages,
    average_by_priority: priorityAverages,
    fastest_completions: fastest,
    slowest_completions: slowest,
    all_data: turnaroundData.slice(0, 100), // Limit for display
  };
}

async function analyzeContractorEfficiency(orders, base44) {
  const contractorStats = {};

  orders.forEach(order => {
    if (!order.assigned_contractor_id) return;

    const contractorId = order.assigned_contractor_id;
    
    if (!contractorStats[contractorId]) {
      contractorStats[contractorId] = {
        contractor_id: contractorId,
        contractor_name: order.assigned_contractor_name,
        total_jobs: 0,
        completed_jobs: 0,
        cancelled_jobs: 0,
        total_cost: 0,
        total_revenue: 0,
        categories: {},
        priorities: {},
        turnaround_sum: 0,
        turnaround_count: 0,
      };
    }

    const stats = contractorStats[contractorId];
    stats.total_jobs++;

    if (order.status === 'completed') {
      stats.completed_jobs++;
      if (order.completed_date && order.created_date) {
        const days = Math.round((new Date(order.completed_date) - new Date(order.created_date)) / (1000 * 60 * 60 * 24));
        stats.turnaround_sum += days;
        stats.turnaround_count++;
      }
    } else if (order.status === 'cancelled') {
      stats.cancelled_jobs++;
    }

    if (order.actual_cost) {
      stats.total_cost += order.actual_cost;
      stats.total_revenue += order.actual_cost;
    } else if (order.estimated_cost) {
      stats.total_cost += order.estimated_cost;
    }

    if (order.category) {
      stats.categories[order.category] = (stats.categories[order.category] || 0) + 1;
    }

    if (order.priority) {
      stats.priorities[order.priority] = (stats.priorities[order.priority] || 0) + 1;
    }
  });

  const contractorAnalysis = Object.values(contractorStats)
    .map(contractor => ({
      ...contractor,
      completion_rate: contractor.total_jobs > 0 
        ? Math.round((contractor.completed_jobs / contractor.total_jobs) * 100 * 10) / 10 
        : 0,
      avg_turnaround_days: contractor.turnaround_count > 0
        ? Math.round(contractor.turnaround_sum / contractor.turnaround_count * 10) / 10
        : null,
      avg_cost_per_job: contractor.total_jobs > 0
        ? Math.round(contractor.total_cost / contractor.total_jobs * 100) / 100
        : 0,
      cost_efficiency_score: calculateCostEfficiency(contractor),
    }))
    .sort((a, b) => b.cost_efficiency_score - a.cost_efficiency_score);

  return {
    report_type: 'contractor_efficiency',
    generated_date: new Date().toISOString(),
    summary: {
      total_contractors: contractorAnalysis.length,
      total_jobs_assigned: orders.filter(o => o.assigned_contractor_id).length,
    },
    contractor_rankings: contractorAnalysis,
  };
}

async function analyzeCosts(orders, base44) {
  const totalEstimated = orders.reduce((sum, o) => sum + (o.estimated_cost || 0), 0);
  const totalActual = orders.reduce((sum, o) => sum + (o.actual_cost || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'completed' && o.actual_cost);

  // Cost by category
  const costByCategory = {};
  orders.forEach(order => {
    if (!order.category) return;
    if (!costByCategory[order.category]) {
      costByCategory[order.category] = {
        category: order.category,
        count: 0,
        estimated_total: 0,
        actual_total: 0,
      };
    }
    costByCategory[order.category].count++;
    costByCategory[order.category].estimated_total += order.estimated_cost || 0;
    costByCategory[order.category].actual_total += order.actual_cost || 0;
  });

  // Cost by property
  const costByProperty = {};
  orders.forEach(order => {
    if (!order.property_id) return;
    if (!costByProperty[order.property_id]) {
      costByProperty[order.property_id] = {
        property_id: order.property_id,
        count: 0,
        total_cost: 0,
      };
    }
    costByProperty[order.property_id].count++;
    costByProperty[order.property_id].total_cost += order.actual_cost || order.estimated_cost || 0;
  });

  // Cost by priority
  const costByPriority = {};
  orders.forEach(order => {
    if (!order.priority) return;
    if (!costByPriority[order.priority]) {
      costByPriority[order.priority] = {
        priority: order.priority,
        count: 0,
        total_cost: 0,
      };
    }
    costByPriority[order.priority].count++;
    costByPriority[order.priority].total_cost += order.actual_cost || order.estimated_cost || 0;
  });

  const variance = totalEstimated - totalActual;
  const variancePercent = totalEstimated > 0 ? ((variance / totalEstimated) * 100) : 0;

  return {
    report_type: 'cost_analysis',
    generated_date: new Date().toISOString(),
    summary: {
      total_orders: orders.length,
      total_estimated_cost: Math.round(totalEstimated * 100) / 100,
      total_actual_cost: Math.round(totalActual * 100) / 100,
      variance: Math.round(variance * 100) / 100,
      variance_percent: Math.round(variancePercent * 10) / 10,
      completed_orders_with_cost: completedOrders.length,
    },
    cost_by_category: Object.values(costByCategory)
      .map(c => ({
        ...c,
        variance: c.estimated_total - c.actual_total,
        avg_cost: c.count > 0 ? Math.round(c.actual_total / c.count * 100) / 100 : 0,
      }))
      .sort((a, b) => b.actual_total - a.actual_total),
    cost_by_property: Object.values(costByProperty)
      .sort((a, b) => b.total_cost - a.total_cost)
      .slice(0, 20),
    cost_by_priority: Object.values(costByPriority)
      .map(p => ({
        ...p,
        avg_cost: p.count > 0 ? Math.round(p.total_cost / p.count * 100) / 100 : 0,
      }))
      .sort((a, b) => b.total_cost - a.total_cost),
  };
}

function extractKeywords(description) {
  const commonIssues = [
    'leak', 'water', 'damp', 'mould', 'crack', 'broken', 'faulty', 'not working',
    'heating', 'boiler', 'radiator', 'pipe', 'drain', 'toilet', 'shower', 'sink',
    'electrical', 'socket', 'light', 'fuse', 'power', 'outage',
    'door', 'window', 'lock', 'key', 'handle', 'hinge',
    'floor', 'wall', 'ceiling', 'roof', 'tile', 'carpet',
    'kitchen', 'bathroom', 'bedroom', 'living room',
  ];
  
  const lowerDesc = (description || '').toLowerCase();
  return commonIssues.filter(keyword => lowerDesc.includes(keyword));
}

function calculateCostEfficiency(contractor) {
  // Score based on: completion rate (40%), avg cost (30%), turnaround (30%)
  const completionScore = contractor.completion_rate;
  
  // Lower cost = higher score (normalize against £500 avg)
  const costScore = Math.max(0, 100 - (contractor.avg_cost_per_job / 5));
  
  // Faster turnaround = higher score (normalize against 10 days avg)
  const turnaroundScore = contractor.avg_turnaround_days 
    ? Math.max(0, 100 - (contractor.avg_turnaround_days * 10))
    : 50;

  return Math.round((completionScore * 0.4 + costScore * 0.3 + turnaroundScore * 0.3) * 10) / 10;
}