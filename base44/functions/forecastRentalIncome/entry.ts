import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, forecast_months = 12 } = await req.json();

    // Fetch historical rent payments (last 24 months)
    const twelvMonthsAgo = new Date();
    twelvMonthsAgo.setMonth(twelvMonthsAgo.getMonth() - 24);

    const historicalTransactions = await base44.asServiceRole.entities.FinancialTransaction.filter({
      property_id,
      transaction_type: 'rent_payment',
      created_date: { $gte: twelvMonthsAgo.toISOString() }
    });

    // Calculate monthly averages and trends
    const monthlyData = {};
    historicalTransactions.forEach(t => {
      const date = new Date(t.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (t.amount || 0);
    });

    const monthlyAmounts = Object.values(monthlyData);
    const avgMonthlyRent = monthlyAmounts.length > 0 
      ? monthlyAmounts.reduce((a, b) => a + b) / monthlyAmounts.length 
      : 0;

    // Calculate trend (simple linear trend)
    let trendFactor = 1;
    if (monthlyAmounts.length >= 2) {
      const firstQuarter = monthlyAmounts.slice(0, Math.floor(monthlyAmounts.length / 2)).reduce((a, b) => a + b) / Math.floor(monthlyAmounts.length / 2);
      const lastQuarter = monthlyAmounts.slice(Math.ceil(monthlyAmounts.length / 2)).reduce((a, b) => a + b) / Math.ceil(monthlyAmounts.length / 2);
      trendFactor = lastQuarter > 0 ? lastQuarter / firstQuarter : 1;
    }

    // Fetch expense data for expense forecasting
    const historicalExpenses = await base44.asServiceRole.entities.FinancialTransaction.filter({
      property_id,
      transaction_type: 'expense',
      created_date: { $gte: twelvMonthsAgo.toISOString() }
    });

    const monthlyExpenses = {};
    historicalExpenses.forEach(t => {
      const date = new Date(t.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + (t.amount || 0);
    });

    const expenseAmounts = Object.values(monthlyExpenses);
    const avgMonthlyExpense = expenseAmounts.length > 0
      ? expenseAmounts.reduce((a, b) => a + b) / expenseAmounts.length
      : 0;

    // Generate forecast
    const forecast = [];
    const now = new Date();
    for (let i = 1; i <= forecast_months; i++) {
      const forecastDate = new Date(now);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      const projectedRent = Math.round(avgMonthlyRent * Math.pow(trendFactor, i / 12));
      const projectedExpense = Math.round(avgMonthlyExpense);
      const projectedProfit = projectedRent - projectedExpense;

      forecast.push({
        month: forecastDate.toISOString().split('T')[0],
        projectedRent,
        projectedExpense,
        projectedProfit
      });
    }

    // Use LLM for detailed analysis
    const prompt = `Analyze the following rental income and expense forecast and provide insights:

Average Monthly Rent: £${avgMonthlyRent / 100}
Rental Trend: ${(trendFactor * 100).toFixed(1)}% (relative)
Average Monthly Expenses: £${avgMonthlyExpense / 100}
Forecast Period: ${forecast_months} months

Forecast Data:
${forecast.slice(0, 3).map(f => `${f.month}: Rent £${f.projectedRent / 100}, Expenses £${f.projectedExpense / 100}, Profit £${f.projectedProfit / 100}`).join('\n')}
...

Provide:
1. Summary of historical performance
2. Key trends observed
3. Risk factors that could impact forecast
4. Recommendations for optimizing rental income
5. Expected profitability over forecast period`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5'
    });

    console.log(`[Financial] Generated ${forecast_months}-month forecast for property ${property_id}`);

    return Response.json({
      success: true,
      forecast,
      summary: {
        avgMonthlyRent: avgMonthlyRent / 100,
        avgMonthlyExpense: avgMonthlyExpense / 100,
        trendFactor,
        totalProjectedRent: forecast.reduce((s, f) => s + f.projectedRent, 0) / 100,
        totalProjectedExpense: forecast.reduce((s, f) => s + f.projectedExpense, 0) / 100,
        totalProjectedProfit: forecast.reduce((s, f) => s + f.projectedProfit, 0) / 100
      },
      analysis
    });
  } catch (error) {
    console.error('[Financial] Forecast error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});