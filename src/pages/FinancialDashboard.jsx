import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertTriangle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { format, parseISO, subMonths, startOfMonth } from 'date-fns';

export default function FinancialDashboard() {
  const [timeRange, setTimeRange] = useState('12m');
  const { propertyIds } = useDemoFilter();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', propertyIds],
    queryFn: async () => {
      const all = await base44.entities.FinancialTransaction.list('-created_date');
      if (propertyIds) return all.filter(t => propertyIds.includes(t.property_id));
      return all;
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', propertyIds],
    queryFn: async () => {
      if (propertyIds) {
        const allProps = await base44.entities.Property.list();
        return allProps.filter(p => propertyIds.includes(p.id));
      }
      return base44.entities.Property.list();
    }
  });

  const propMap = properties.reduce((m, p) => { m[p.id] = p; return m; }, {});

  // Calculate key metrics
  const totalIncome = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalArrears = transactions.filter(t => t.status === 'overdue').reduce((s, t) => s + (t.amount || 0), 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Monthly cash flow data
  const monthlyData = {};
  transactions.forEach(t => {
    if (!t.paid_date && !t.due_date) return;
    const date = parseISO(t.paid_date || t.due_date);
    const monthKey = format(date, 'yyyy-MM');
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: format(date, 'MMM yy'), income: 0, expenses: 0, netFlow: 0 };
    }
    const amount = t.amount || 0;
    if (t.direction === 'income' && t.status === 'paid') {
      monthlyData[monthKey].income += amount;
    } else if (t.direction === 'expense' && t.status === 'paid') {
      monthlyData[monthKey].expenses += amount;
    }
  });

  const months = parseInt(timeRange);
  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-months)
    .map(m => ({ ...m, netFlow: m.income - m.expenses }));

  // Arrears by property
  const arrearsData = {};
  properties.forEach(p => {
    arrearsData[p.id] = { name: p.name, amount: 0 };
  });

  transactions.filter(t => t.status === 'overdue').forEach(t => {
    if (t.property_id && arrearsData[t.property_id]) {
      arrearsData[t.property_id].amount += t.amount || 0;
    }
  });

  const arrearsChartData = Object.values(arrearsData)
    .filter(p => p.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Income breakdown by type
  const incomeByType = {};
  transactions.filter(t => t.direction === 'income' && t.status === 'paid').forEach(t => {
    const type = t.transaction_type || 'other';
    incomeByType[type] = (incomeByType[type] || 0) + (t.amount || 0);
  });

  const incomeChartData = Object.entries(incomeByType).map(([type, amount]) => ({
    name: type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1),
    value: amount
  }));

  // Expense breakdown by type
  const expenseByType = {};
  transactions.filter(t => t.direction === 'expense' && t.status === 'paid').forEach(t => {
    const type = t.transaction_type || 'other';
    expenseByType[type] = (expenseByType[type] || 0) + (t.amount || 0);
  });

  const expenseChartData = Object.entries(expenseByType).map(([type, amount]) => ({
    name: type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1),
    value: amount
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader title="Financial Dashboard" subtitle="Portfolio-wide income, expenses & cash flow analysis" />
        <div className="w-[200px]">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Income" 
          value={`£${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          highlight={true}
        />
        <StatCard 
          title="Total Expenses" 
          value={`£${totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingDown}
        />
        <StatCard 
          title="Net Cash Flow" 
          value={`£${netCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          highlight={netCashFlow >= 0}
        />
        <StatCard 
          title="Outstanding Arrears" 
          value={`£${totalArrears.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={AlertTriangle}
        />
      </div>

      {/* Monthly Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Net Flow Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Net Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                <Line 
                  type="monotone" 
                  dataKey="netFlow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Net Flow"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Income & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: £${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No income data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: £${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No expense data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Arrears by Property */}
      {arrearsChartData.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Outstanding Arrears by Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={arrearsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => `£${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                <Bar dataKey="amount" fill="#ef4444" name="Arrears" />
              </BarChart>
            </ResponsiveContainer>

            <div className="bg-white rounded-lg border border-red-200 p-4">
              <h4 className="font-semibold text-sm mb-3">Arrears Breakdown</h4>
              <div className="space-y-2">
                {arrearsChartData.map((prop, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded-lg">
                    <span>{prop.name}</span>
                    <span className="font-semibold text-red-900">£{prop.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No financial data available. Create transactions to see dashboard insights.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}