import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProfitabilityMetrics from '@/components/financials/ProfitabilityMetrics';
import MonthlyRevenueChart from '@/components/financials/MonthlyRevenueChart';
import ExpenseBreakdownChart from '@/components/financials/ExpenseBreakdownChart';
import OverduePaymentsPanel from '@/components/financials/OverduePaymentsPanel';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar } from 'lucide-react';
import moment from 'moment';

export default function FinancialReporting() {
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(12, 'months').startOf('month'),
    endDate: moment().endOf('month'),
  });

  // Fetch financial transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', dateRange],
    queryFn: async () => {
      return await base44.entities.FinancialTransaction.filter({});
    },
  });

  // Fetch properties for aggregation
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      return await base44.entities.Property.list();
    },
  });

  // Fetch maintenance orders for expense calculation
  const { data: maintenance = [] } = useQuery({
    queryKey: ['maintenance-orders'],
    queryFn: async () => {
      return await base44.entities.MaintenanceRequest.list();
    },
  });

  // Process data
  const processedData = React.useMemo(() => {
    const monthlyData = [];
    const current = moment(dateRange.startDate).clone();
    
    // Initialize 12 months of data
    while (current.isBefore(dateRange.endDate)) {
      const monthKey = current.format('MMM YY');
      const monthStart = current.clone().startOf('month');
      const monthEnd = current.clone().endOf('month');

      const monthTransactions = transactions.filter(t => {
        const tDate = moment(t.created_date);
        return tDate.isBetween(monthStart, monthEnd, null, '[]');
      });

      const expectedIncome = monthTransactions
        .filter(t => t.type === 'rent_expected')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const receivedIncome = monthTransactions
        .filter(t => t.type === 'rent_received')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      monthlyData.push({
        month: monthKey,
        expected: expectedIncome,
        received: receivedIncome,
      });

      current.add(1, 'month');
    }

    // Process expenses by category
    const expensesByCategory = {};
    const maintenanceCosts = maintenance
      .filter(m => m.actual_cost && m.completion_date)
      .reduce((sum, m) => sum + (m.actual_cost || 0), 0);

    transactions
      .filter(t => t.type === 'expense' && moment(t.created_date).isBetween(dateRange.startDate, dateRange.endDate, null, '[]'))
      .forEach(t => {
        const category = t.category || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (t.amount || 0);
      });

    // Add maintenance to expenses
    if (maintenanceCosts > 0) {
      expensesByCategory['Maintenance & Repairs'] = (expensesByCategory['Maintenance & Repairs'] || 0) + maintenanceCosts;
    }

    const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate metrics
    const totalIncome = transactions
      .filter(t => ['rent_received', 'rent_expected'].includes(t.type))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, v) => sum + v, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Overdue payments (older than 30 days)
    const overduePayments = transactions
      .filter(t => {
        if (t.type !== 'rent_expected') return false;
        if (t.paid === true) return false;
        const daysOverdue = moment().diff(moment(t.created_date), 'days');
        return daysOverdue > 30;
      })
      .map(t => ({
        amount: t.amount || 0,
        tenant: t.tenant_name || 'Unknown',
        property: t.property_name || 'Unknown',
        daysOverdue: moment().diff(moment(t.created_date), 'days'),
      }));

    return {
      monthlyData,
      expenseChartData,
      overduePayments,
      metrics: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        roi: properties.length > 0 ? (netProfit / (properties.length * 50000)) * 100 : 0,
        propertyCount: properties.length,
        tenancyCount: transactions.filter(t => t.type === 'rent_expected').length,
      },
    };
  }, [transactions, maintenance, dateRange, properties]);

  const handleExportReport = () => {
    // Create simple CSV export
    const csv = [
      ['Financial Report', dateRange.startDate.format('DD/MM/YYYY'), 'to', dateRange.endDate.format('DD/MM/YYYY')],
      [],
      ['Metrics'],
      ['Total Income (12M)', `£${processedData.metrics.totalIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`],
      ['Total Expenses (12M)', `£${processedData.metrics.totalExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`],
      ['Net Profit', `£${processedData.metrics.netProfit.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`],
      ['Profit Margin', `${processedData.metrics.profitMargin.toFixed(1)}%`],
      [],
      ['Monthly Data'],
      ['Month', 'Expected', 'Received'],
      ...processedData.monthlyData.map(m => [m.month, m.expected, m.received]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Financial Reporting"
        description="Comprehensive financial analysis and profitability tracking"
      />

      {/* Controls */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          12 Months
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button onClick={handleExportReport} size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <ProfitabilityMetrics metrics={processedData.metrics} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyRevenueChart data={processedData.monthlyData} />
        <ExpenseBreakdownChart data={processedData.expenseChartData} />
      </div>

      {/* Overdue Payments */}
      <OverduePaymentsPanel data={processedData.overduePayments} />

      {/* Property Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold">Property</th>
                  <th className="text-right py-2 px-4 font-semibold">Income</th>
                  <th className="text-right py-2 px-4 font-semibold">Expenses</th>
                  <th className="text-right py-2 px-4 font-semibold">Net Profit</th>
                  <th className="text-right py-2 px-4 font-semibold">Yield</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted-foreground">
                      Add properties to view performance data
                    </td>
                  </tr>
                ) : (
                  properties.map(prop => {
                    const propTransactions = transactions.filter(t => t.property_id === prop.id);
                    const propIncome = propTransactions
                      .filter(t => t.type === 'rent_received')
                      .reduce((sum, t) => sum + (t.amount || 0), 0);
                    const propExpenses = propTransactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + (t.amount || 0), 0);
                    const propProfit = propIncome - propExpenses;
                    const propYield = propIncome > 0 ? (propProfit / propIncome) * 100 : 0;

                    return (
                      <tr key={prop.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{prop.name}</td>
                        <td className="text-right py-3 px-4">£{propIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                        <td className="text-right py-3 px-4 text-red-600">£{propExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</td>
                        <td className={`text-right py-3 px-4 font-semibold ${propProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          £{propProfit.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="text-right py-3 px-4">{propYield.toFixed(1)}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}