import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, start_date, end_date, statement_type } = await req.json();

    // Fetch all financial transactions
    const transactions = await base44.asServiceRole.entities.FinancialTransaction.filter({
      property_id,
      created_date: { $gte: start_date, $lte: end_date }
    });

    // Categorize transactions
    const income = transactions.filter(t => t.transaction_type === 'rent_payment' || t.transaction_type === 'income');
    const expenses = transactions.filter(t => t.transaction_type === 'expense' || t.transaction_type === 'maintenance');
    const deposits = transactions.filter(t => t.transaction_type === 'deposit');

    // Calculate totals
    const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    // Group by category for detailed breakdown
    const incomeByCategory = {};
    const expenseByCategory = {};

    income.forEach(t => {
      const cat = t.category || 'Other Income';
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + (t.amount || 0);
    });

    expenses.forEach(t => {
      const cat = t.category || 'Other Expenses';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (t.amount || 0);
    });

    // Fetch property data
    const property = await base44.asServiceRole.entities.Property.get(property_id);
    const units = await base44.asServiceRole.entities.Unit.filter({ property_id });

    // Generate P&L Statement
    if (statement_type === 'pl' || statement_type === 'both') {
      const prompt = `Generate a professional Profit & Loss Statement for a property with the following financial data:

Period: ${start_date} to ${end_date}
Property: ${property.address}

REVENUE:
${Object.entries(incomeByCategory).map(([cat, amt]) => `${cat}: £${amt / 100}`).join('\n')}
Total Revenue: £${totalIncome / 100}

EXPENSES:
${Object.entries(expenseByCategory).map(([cat, amt]) => `${cat}: £${amt / 100}`).join('\n')}
Total Expenses: £${totalExpenses / 100}

NET PROFIT: £${netProfit / 100}

Create a formal P&L statement with:
1. Header with company name, property address, and period
2. Revenue section with line items and subtotal
3. Expenses section with detailed categories
4. Net Profit/Loss calculation
5. Year-over-year comparison notes (if available)
6. Professional formatting for PDF export`;

      const plStatement = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5'
      });

      // Save P&L statement
      await base44.asServiceRole.entities.FinancialReport.create({
        property_id,
        report_type: 'profit_loss',
        report_period_start: start_date,
        report_period_end: end_date,
        generated_date: new Date().toISOString(),
        generated_by: user.email,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        data_breakdown: {
          incomeByCategory,
          expenseByCategory
        },
        document_url: '',
        status: 'draft'
      });

      return Response.json({
        success: true,
        statement_type: 'pl',
        plStatement,
        summary: {
          totalIncome: totalIncome / 100,
          totalExpenses: totalExpenses / 100,
          netProfit: netProfit / 100
        }
      });
    }

    return Response.json({ error: 'Invalid statement type' }, { status: 400 });
  } catch (error) {
    console.error('[Financial] Statement generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});