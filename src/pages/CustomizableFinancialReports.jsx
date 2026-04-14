import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, Filter, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { format, startOfYear, endOfYear, subMonths } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CustomizableFinancialReports() {
  const [reportType, setReportType] = useState('property-pl');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [dateRange, setDateRange] = useState('ytd');
  const [customStartDate, setCustomStartDate] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100),
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', selectedProperty, dateRange],
    queryFn: () => base44.entities.FinancialTransaction.list('-updated_date', 500),
    enabled: !!selectedProperty || reportType !== 'property-pl',
  });

  const unitsQuery = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('-updated_date', 500),
  });

  const certificatesQuery = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const gas = await base44.entities.GasSafetyCertificate.list('-updated_date', 100);
      const eicr = await base44.entities.EICRCertificate.list('-updated_date', 100);
      return { gas, eicr };
    },
  });

  const { data: properties = [] } = propertiesQuery;
  const { data: transactions = [] } = transactionsQuery;
  const { data: units = [] } = unitsQuery;
  const { data: certificates = { gas: [], eicr: [] } } = certificatesQuery;

  // Calculate date range
  const getDateRange = () => {
    const end = new Date(customEndDate);
    let start;
    switch (dateRange) {
      case 'ytd':
        start = startOfYear(new Date());
        break;
      case 'last-12':
        start = subMonths(end, 12);
        break;
      case 'custom':
        start = new Date(customStartDate);
        break;
      default:
        start = startOfYear(new Date());
    }
    return { start, end };
  };

  // Filter transactions by date
  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange();
    return transactions.filter(t => {
      const tDate = new Date(t.created_date);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, dateRange, customStartDate, customEndDate]);

  // Property P&L Report
  const propertyPLReport = useMemo(() => {
    if (!selectedProperty) return null;
    
    const propTransactions = filteredTransactions.filter(t => t.property_id === selectedProperty);
    const income = propTransactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    const expenses = propTransactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      profitMargin: income > 0 ? ((income - expenses) / income * 100).toFixed(2) : 0,
      transactionCount: propTransactions.length,
    };
  }, [filteredTransactions, selectedProperty]);

  // Annual Summary Report
  const annualSummaryReport = useMemo(() => {
    const income = filteredTransactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    const expenses = filteredTransactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    
    // Group by category
    const byCategory = {};
    filteredTransactions.forEach(t => {
      const cat = t.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += t.amount || 0;
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
      propertyCount: new Set(filteredTransactions.map(t => t.property_id)).size,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const months = {};
    filteredTransactions.forEach(t => {
      const month = format(new Date(t.created_date), 'MMM yyyy');
      if (!months[month]) months[month] = { income: 0, expenses: 0 };
      if (t.direction === 'income') months[month].income += t.amount || 0;
      else months[month].expenses += t.amount || 0;
    });
    return Object.entries(months).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }));
  }, [filteredTransactions]);

  // Expense breakdown
  const expenseBreakdown = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.direction === 'expense');
    const byType = {};
    expenses.forEach(e => {
      const type = e.category || 'other';
      if (!byType[type]) byType[type] = 0;
      byType[type] += e.amount || 0;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const handleDownloadReport = () => {
    const reportData = {
      type: reportType,
      generatedDate: new Date().toISOString(),
      dateRange: { start: customStartDate, end: customEndDate },
      data: reportType === 'property-pl' ? propertyPLReport : annualSummaryReport,
    };
    const element = document.createElement('a');
    element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    element.download = `${reportType}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    element.click();
  };

  const COLORS = ['hsl(222,47%,15%)', 'hsl(43,74%,49%)', 'hsl(173,58%,39%)', 'hsl(12,76%,61%)', 'hsl(197,37%,24%)'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader 
          title="Financial Reports" 
          subtitle="Customizable reports for landlords and property managers"
        >
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </PageHeader>

        {/* Report Type & Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Report Type */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="property-pl">Property P&L</option>
                <option value="annual-summary">Annual Summary</option>
                <option value="monthly-trend">Monthly Trend</option>
                <option value="expense-breakdown">Expense Breakdown</option>
              </select>
            </div>

            {/* Property Selection */}
            {reportType === 'property-pl' && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Select Property</label>
                <select 
                  value={selectedProperty || ''}
                  onChange={(e) => setSelectedProperty(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">Choose property...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="ytd">Year to Date</option>
                <option value="last-12">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Dates */}
            {dateRange === 'custom' && (
              <div className="md:col-span-1">
                <label className="text-sm font-semibold text-foreground mb-2 block">End Date</label>
                <input 
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
            )}
          </div>

          {dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Start Date</label>
                <input 
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Property P&L Report */}
        {reportType === 'property-pl' && propertyPLReport && selectedProperty && (
          <div className="space-y-6 mb-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Income</p>
                <p className="text-3xl font-bold text-green-600">£{propertyPLReport.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">£{propertyPLReport.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
                <p className={`text-3xl font-bold ${propertyPLReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{propertyPLReport.netProfit.toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Profit Margin</p>
                <p className="text-3xl font-bold text-primary">{propertyPLReport.profitMargin}%</p>
              </div>
            </div>

            {/* Detailed P&L Table */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Profit & Loss Statement</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-green-50 dark:bg-green-950 rounded">
                  <span className="font-semibold text-green-700 dark:text-green-300">Total Income</span>
                  <span className="font-bold text-green-700 dark:text-green-300">£{propertyPLReport.totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 dark:bg-red-950 rounded">
                  <span className="font-semibold text-red-700 dark:text-red-300">Total Expenses</span>
                  <span className="font-bold text-red-700 dark:text-red-300">-£{propertyPLReport.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Net Profit / Loss</span>
                  <span className={propertyPLReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    £{propertyPLReport.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Annual Summary Report */}
        {reportType === 'annual-summary' && annualSummaryReport && (
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Income</p>
                <p className="text-3xl font-bold text-green-600">£{annualSummaryReport.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">£{annualSummaryReport.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
                <p className={`text-3xl font-bold ${annualSummaryReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{annualSummaryReport.netProfit.toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Properties</p>
                <p className="text-3xl font-bold text-primary">{annualSummaryReport.propertyCount}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Expense Breakdown by Category</h3>
              {annualSummaryReport.byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={annualSummaryReport.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                      {annualSummaryReport.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No transaction data</p>
              )}
            </div>
          </div>
        )}

        {/* Monthly Trend Report */}
        {reportType === 'monthly-trend' && monthlyTrendData.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                <Bar dataKey="income" fill="hsl(173,58%,39%)" name="Income" />
                <Bar dataKey="expenses" fill="hsl(12,76%,61%)" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expense Breakdown Report */}
        {reportType === 'expense-breakdown' && expenseBreakdown.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={expenseBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="hsl(12,76%,61%)" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}