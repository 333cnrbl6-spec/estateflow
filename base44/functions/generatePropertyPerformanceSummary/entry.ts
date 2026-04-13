import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, months = 12 } = await req.json();
    
    // Fetch all financial transactions for the property
    const query = property_id 
      ? { property_id } 
      : {}; // Get all if no property specified
    
    const transactions = await base44.entities.FinancialTransaction.filter(query);
    
    // Generate monthly summary
    const today = new Date();
    const monthlyData = {};
    
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = { income: 0, expenditure: 0, month: monthKey };
    }
    
    // Aggregate transactions by month
    transactions.forEach(tx => {
      if (!tx.created_date) return;
      const monthKey = tx.created_date.slice(0, 7);
      
      if (monthlyData[monthKey]) {
        const amount = tx.amount || 0;
        if (tx.transaction_type === 'income' || tx.transaction_type === 'rent_payment') {
          monthlyData[monthKey].income += amount;
        } else if (tx.transaction_type === 'expense' || tx.transaction_type === 'expenditure') {
          monthlyData[monthKey].expenditure += amount;
        }
      }
    });
    
    // Sort by month ascending
    const summary = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate totals
    const totals = {
      totalIncome: summary.reduce((s, m) => s + m.income, 0),
      totalExpenditure: summary.reduce((s, m) => s + m.expenditure, 0),
      netProfit: 0,
    };
    totals.netProfit = totals.totalIncome - totals.totalExpenditure;
    
    return Response.json({
      success: true,
      summary,
      totals,
      transactionCount: transactions.length,
      periodMonths: months,
    });
  } catch (error) {
    console.error('Error generating property performance summary:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});