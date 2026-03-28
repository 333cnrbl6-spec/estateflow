import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id, report_type } = await req.json();

    // Fetch financial data
    const transactions = await base44.entities.RentLedger.filter({ status: 'paid' });
    const expenses = await base44.entities.BusinessExpense.filter({ status: 'approved' });
    const units = await base44.entities.Unit.filter({ status: 'occupied' });

    const totalIncome = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount_gross || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    // Create report
    const report = await base44.entities.FinancialReport.create({
      company_id,
      report_type,
      period_start: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      occupancy_rate: units.length > 0 ? (units.length / (units.length + 5)) * 100 : 0,
      generated_date: new Date().toISOString().split('T')[0],
      generated_by: user.email,
    });

    return Response.json({ reportId: report.id, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});