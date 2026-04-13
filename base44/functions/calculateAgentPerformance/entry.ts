import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, date_range = 'all' } = await req.json();

    // Calculate date range
    const now = new Date();
    let startDate;
    if (date_range === '30_days') startDate = new Date(now.setDate(now.getDate() - 30));
    else if (date_range === '90_days') startDate = new Date(now.setDate(now.getDate() - 90));
    else if (date_range === '1_year') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    else startDate = new Date(0); // All time

    // Fetch all relevant data with error handling
    let leads = [], listings = [], transactions = [], communications = [];
    
    try {
      leads = await base44.entities.SalesLead.filter({});
      listings = await base44.entities.SalesListing.filter({});
      transactions = await base44.entities.SalesTransaction.filter({});
      communications = await base44.entities.SalesCommunication.filter({});
    } catch (fetchError) {
      console.error('Error fetching sales data:', fetchError);
      return Response.json({ error: 'Failed to fetch performance data', details: fetchError.message }, { status: 500 });
    }

    // Filter by agent if specified
    const agentFilter = agent_id ? (item) => 
      item.assigned_agent_id === agent_id || 
      item.listing_agent_id === agent_id ||
      item.agent_id === agent_id
    : () => true;

    const agentLeads = leads.filter(agentFilter);
    const agentListings = listings.filter(agentFilter);
    const agentTransactions = transactions.filter(agentFilter);

    // Calculate metrics
    const metrics = {
      // Lead Conversion Metrics
      lead_conversion: {
        total_leads: agentLeads.length,
        converted_leads: agentLeads.filter(l => l.status === 'converted').length,
        conversion_rate: agentLeads.length > 0 
          ? Math.round((agentLeads.filter(l => l.status === 'converted').length / agentLeads.length) * 100)
          : 0,
        by_priority: {
          hot: agentLeads.filter(l => l.priority_tier === 'hot').length,
          warm: agentLeads.filter(l => l.priority_tier === 'warm').length,
          cold: agentLeads.filter(l => l.priority_tier === 'cold').length,
        },
        by_source: agentLeads.reduce((acc, lead) => {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
          return acc;
        }, {}),
      },

      // Offer-to-Sale Ratio
      offer_to_sale: {
        total_offers: agentTransactions.length,
        completed_sales: agentTransactions.filter(t => t.status === 'completed').length,
        completion_rate: agentTransactions.length > 0
          ? Math.round((agentTransactions.filter(t => t.status === 'completed').length / agentTransactions.length) * 100)
          : 0,
        fallen_through: agentTransactions.filter(t => t.status === 'fallen_through').length,
        pending: agentTransactions.filter(t => !['completed', 'fallen_through'].includes(t.status)).length,
      },

      // Time on Market
      time_on_market: {
        average_days: agentTransactions.filter(t => t.days_on_market).length > 0
          ? Math.round(agentTransactions.reduce((sum, t) => sum + (t.days_on_market || 0), 0) / 
                      agentTransactions.filter(t => t.days_on_market).length)
          : 0,
        median_days: (() => {
          const days = agentTransactions
            .filter(t => t.days_on_market)
            .map(t => t.days_on_market)
            .sort((a, b) => a - b);
          return days.length > 0 ? days[Math.floor(days.length / 2)] : 0;
        })(),
        by_property_type: agentListings.reduce((acc, listing) => {
          const type = listing.property_type || 'other';
          if (!acc[type]) acc[type] = { count: 0, total_days: 0 };
          acc[type].count++;
          return acc;
        }, {}),
      },

      // Outreach Effectiveness
      outreach: {
        total_communications: communications.filter(c => 
          agent_id ? c.sender_id === agent_id : true
        ).length,
        by_type: communications.reduce((acc, comm) => {
          acc[comm.message_type] = (acc[comm.message_type] || 0) + 1;
          return acc;
        }, {}),
        response_rate: 0, // Would need message thread data to calculate
        avg_response_time: 0, // Would need timestamps
      },

      // Performance Summary
      summary: {
        total_value_sold: agentTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.sale_price || 0), 0),
        total_commission: agentTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (t.agent_commission || 0), 0),
        active_listings_value: agentListings
          .filter(l => ['active', 'under_offer'].includes(l.status))
          .reduce((sum, l) => sum + (l.asking_price || 0), 0),
        deals_in_pipeline: agentTransactions.filter(t => !['completed', 'fallen_through'].includes(t.status)).length,
      },

      // Trends (monthly breakdown)
      trends: {
        monthly_leads: getMonthlyBreakdown(agentLeads, 'created_date'),
        monthly_sales: getMonthlyBreakdown(
          agentTransactions.filter(t => t.status === 'completed'), 
          'completion_date'
        ),
        monthly_revenue: getMonthlyRevenue(agentTransactions),
      }
    };

    return Response.json({ success: true, metrics });
  } catch (error) {
    console.error('Error calculating agent performance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper function to get monthly breakdown
function getMonthlyBreakdown(items, dateField) {
  const monthly = {};
  items.forEach(item => {
    const date = new Date(item[dateField]);
    if (!isNaN(date.getTime())) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    }
  });
  return monthly;
}

function getMonthlyRevenue(transactions) {
  const monthly = {};
  transactions
    .filter(t => t.status === 'completed' && t.completion_date)
    .forEach(t => {
      const date = new Date(t.completion_date);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = (monthly[key] || 0) + (t.agent_commission || 0);
      }
    });
  return monthly;
}