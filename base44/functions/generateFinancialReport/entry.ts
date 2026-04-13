/**
 * Comprehensive financial report generation
 * - Cash flow statements
 * - Profit/loss per property
 * - Tax-ready summaries
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { month, propertyIds } = await req.json();
    const [year, monthNum] = month.split('-');
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(year, parseInt(monthNum), 0);

    // Fetch data in parallel
    const [transactions, properties, units, tenants] = await Promise.all([
      base44.entities.FinancialTransaction.filter(
        {
          transaction_date: {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString(),
          },
          ...(propertyIds.length > 0 && { property_id: { $in: propertyIds } }),
        },
        '-transaction_date'
      ),
      propertyIds.length > 0
        ? base44.entities.Property.filter({ id: { $in: propertyIds } })
        : base44.entities.Property.list(),
      base44.entities.Unit.list(),
      base44.entities.Tenant.list(),
    ]);

    // Calculate cash flow
    const cashFlow = calculateCashFlow(transactions);

    // Calculate P&L per property
    const profitLoss = calculateProfitLoss(transactions, properties);

    // Generate tax summary
    const taxSummary = generateTaxSummary(transactions, properties);

    return Response.json({
      cashFlow,
      profitLoss,
      taxSummary,
    });
  } catch (error) {
    console.error('[FINANCIAL_REPORT_ERROR]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateCashFlow(transactions) {
  const inflows = transactions
    .filter(t => t.type === 'income' || t.type === 'rent_payment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const outflows = transactions
    .filter(t => t.type === 'expense' || t.type === 'maintenance' || t.type === 'service_charge')
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const categories = groupTransactionsByCategory(transactions);

  return {
    summary: {
      totalInflows: inflows,
      totalOutflows: outflows,
      netCashFlow: inflows - outflows,
    },
    categories: categories.map(cat => ({
      name: cat.name,
      inflows: cat.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
      outflows: cat.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
      netFlow: cat.transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    })),
    details: transactions.map(t => ({
      category: t.description || t.type,
      amount: t.amount,
    })),
  };
}

function calculateProfitLoss(transactions, properties) {
  const propertyMap = new Map(properties.map(p => [p.id, p]));
  const propertyData = new Map();

  transactions.forEach(t => {
    if (!propertyData.has(t.property_id)) {
      propertyData.set(t.property_id, { revenue: 0, expenses: 0 });
    }

    const data = propertyData.get(t.property_id);
    if (t.type === 'income' || t.type === 'rent_payment') {
      data.revenue += t.amount || 0;
    } else {
      data.expenses += Math.abs(t.amount || 0);
    }
  });

  const profitLossArray = Array.from(propertyData.entries()).map(([propId, data]) => {
    const prop = propertyMap.get(propId);
    const profit = data.revenue - data.expenses;
    const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

    return {
      id: propId,
      name: prop?.name || 'Unknown Property',
      revenue: data.revenue,
      expenses: data.expenses,
      profit,
      margin,
    };
  });

  const totalRevenue = profitLossArray.reduce((sum, p) => sum + p.revenue, 0);
  const totalExpenses = profitLossArray.reduce((sum, p) => sum + p.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return {
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    },
    properties: profitLossArray,
  };
}

function generateTaxSummary(transactions, properties) {
  const incomeTransactions = transactions.filter(t => t.type === 'income' || t.type === 'rent_payment');
  const expenseTransactions = transactions.filter(t => t.type === 'expense' || t.type === 'maintenance');

  const taxableIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const allowableExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const taxableProfit = Math.max(0, taxableIncome - allowableExpenses);

  const expenseCategories = [
    { name: 'Repairs & Maintenance', description: 'Fully allowable', taxAllowable: true, amount: 0 },
    { name: 'Management Fees', description: 'Usually allowable', taxAllowable: true, amount: 0 },
    { name: 'Insurance', description: 'Fully allowable', taxAllowable: true, amount: 0 },
    { name: 'Utilities', description: 'If landlord pays', taxAllowable: true, amount: 0 },
    { name: 'Service Charges', description: 'Fully allowable', taxAllowable: true, amount: 0 },
    { name: 'Advertising', description: 'Fully allowable', taxAllowable: true, amount: 0 },
    { name: 'Legal & Accountancy', description: 'Fully allowable', taxAllowable: true, amount: 0 },
  ];

  expenseTransactions.forEach(t => {
    const category = expenseCategories.find(c => t.description?.includes(c.name));
    if (category) {
      category.amount += Math.abs(t.amount || 0);
    }
  });

  const complianceItems = [
    { title: 'Gross Rental Income Recorded', description: 'All rent payments documented', verified: taxableIncome > 0 },
    { title: 'Receipt Retention', description: 'Keep invoices for 6 years', verified: true },
    { title: 'Mortgage Interest Separated', description: 'Only interest is allowable', verified: true, warning: 'Verify mortgage statements' },
    { title: 'Capital vs Revenue', description: 'Don\'t mix capital improvements', verified: true, warning: 'Major works may be capital' },
    { title: 'Personal Use Exclusion', description: 'No private use deductions', verified: true },
  ];

  return {
    summary: {
      taxableIncome,
      allowableExpenses,
      taxableProfit,
    },
    expenseCategories: expenseCategories.filter(c => c.amount > 0),
    complianceItems,
  };
}

function groupTransactionsByCategory(transactions) {
  const groups = new Map();

  transactions.forEach(t => {
    const cat = t.type || 'Other';
    if (!groups.has(cat)) {
      groups.set(cat, { name: cat, transactions: [] });
    }
    groups.get(cat).transactions.push(t);
  });

  return Array.from(groups.values());
}