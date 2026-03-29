import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, AlertTriangle, FileDown, Printer,
  PoundSterling, Clock, CheckCircle, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import PropertyIncomeTable from '@/components/financials/PropertyIncomeTable';
import PendingExpensesPanel from '@/components/financials/PendingExpensesPanel';
import TaxSummaryPrint from '@/components/financials/TaxSummaryPrint';

const fmt = (n) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmt2 = (n) => `£${(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const COLORS = ['#0f4c81','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

export default function OwnerFinancialDashboard() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedCompany, setSelectedCompany] = useState('all');
  const { propertyIds } = useDemoFilter();

  const { data: transactions = [] } = useQuery({
    queryKey: ['owner-txns', propertyIds],
    queryFn: async () => {
      const all = await base44.entities.FinancialTransaction.list('-created_date', 500);
      if (propertyIds) return all.filter(t => propertyIds.includes(t.property_id));
      return all;
    }
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['owner-props', propertyIds],
    queryFn: async () => {
      const all = await base44.entities.Property.list();
      if (propertyIds) return all.filter(p => propertyIds.includes(p.id));
      return all;
    }
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['owner-companies'],
    queryFn: () => base44.entities.Company.list()
  });

  const propMap = useMemo(() =>
    properties.reduce((m, p) => { m[p.id] = p; return m; }, {}),
    [properties]
  );

  // Filter by selected company (via owning_company on property)
  const filteredPropertyIds = useMemo(() => {
    if (selectedCompany === 'all') return null;
    return properties.filter(p => p.owning_company === selectedCompany || p.management_company === selectedCompany).map(p => p.id);
  }, [selectedCompany, properties]);

  const filteredTransactions = useMemo(() => {
    if (!filteredPropertyIds) return transactions;
    return transactions.filter(t => filteredPropertyIds.includes(t.property_id));
  }, [transactions, filteredPropertyIds]);

  // Month filter
  const monthStart = startOfMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth), 1));
  const monthEnd = endOfMonth(monthStart);

  const monthTransactions = useMemo(() =>
    filteredTransactions.filter(t => {
      const dateStr = t.paid_date || t.due_date;
      if (!dateStr) return false;
      try {
        return isWithinInterval(parseISO(dateStr), { start: monthStart, end: monthEnd });
      } catch { return false; }
    }),
    [filteredTransactions, selectedMonth, selectedYear]
  );

  // KPI Metrics for selected month
  const totalIncome = monthTransactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = monthTransactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalPending = monthTransactions.filter(t => t.direction === 'expense' && (t.status === 'pending' || t.status === 'overdue')).reduce((s, t) => s + (t.amount || 0), 0);
  const totalArrears = filteredTransactions.filter(t => t.status === 'overdue').reduce((s, t) => s + (t.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // 12-month trend data
  const monthlyTrend = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(t => {
      const dateStr = t.paid_date || t.due_date;
      if (!dateStr) return;
      try {
        const d = parseISO(dateStr);
        const key = format(d, 'yyyy-MM');
        const label = format(d, 'MMM yy');
        if (!map[key]) map[key] = { key, label, income: 0, expenses: 0 };
        if (t.direction === 'income' && t.status === 'paid') map[key].income += t.amount || 0;
        if (t.direction === 'expense' && t.status === 'paid') map[key].expenses += t.amount || 0;
      } catch {}
    });
    return Object.values(map)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12)
      .map(m => ({ ...m, net: m.income - m.expenses }));
  }, [filteredTransactions]);

  // Expense category breakdown for month
  const expenseBreakdown = useMemo(() => {
    const map = {};
    monthTransactions.filter(t => t.direction === 'expense' && t.status === 'paid').forEach(t => {
      const k = (t.transaction_type || 'other').replace(/_/g, ' ');
      const label = k.charAt(0).toUpperCase() + k.slice(1);
      if (!map[label]) map[label] = 0;
      map[label] += t.amount || 0;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  // Income by property (for pie chart data)
  const incomeByProperty = useMemo(() => {
    const map = {};
    monthTransactions.filter(t => t.direction === 'income' && t.status === 'paid').forEach(t => {
      const k = propMap[t.property_id]?.name || 'Unassigned';
      if (!map[k]) map[k] = { name: k, amount: 0, count: 0 };
      map[k].amount += t.amount || 0;
      map[k].count += 1;
    });
    return Object.values(map);
  }, [monthTransactions, propMap]);

  // Pending expenses list for print
  const pendingExpensesList = monthTransactions
    .filter(t => t.direction === 'expense' && (t.status === 'pending' || t.status === 'overdue'))
    .map(t => ({
      description: t.description || (t.transaction_type || '').replace(/_/g, ' '),
      property: propMap[t.property_id]?.name || 'Portfolio',
      due_date: t.due_date ? format(parseISO(t.due_date), 'dd/MM/yyyy') : '',
      amount: t.amount || 0
    }));

  const expenseByType = monthTransactions
    .filter(t => t.direction === 'expense' && t.status === 'paid')
    .reduce((acc, t) => {
      const k = (t.transaction_type || 'other').replace(/_/g, ' ');
      const label = k.charAt(0).toUpperCase() + k.slice(1);
      if (!acc[label]) acc[label] = { name: label, amount: 0, count: 0 };
      acc[label].amount += t.amount || 0;
      acc[label].count += 1;
      return acc;
    }, {});

  const printData = {
    totalIncome,
    totalExpenses,
    totalPending,
    netProfit,
    incomeByProperty: incomeByProperty.map(r => ({ name: r.name, amount: r.amount, count: r.count })),
    expenseByType: Object.values(expenseByType),
    pendingExpenses: pendingExpensesList,
    transactions: monthTransactions.map(t => ({
      date: (t.paid_date || t.due_date) ? format(parseISO(t.paid_date || t.due_date), 'dd/MM/yyyy') : '—',
      description: t.description || (t.transaction_type || '').replace(/_/g, ' '),
      type: (t.transaction_type || '').replace(/_/g, ' '),
      status: t.status,
      direction: t.direction,
      amount: t.amount || 0
    }))
  };

  const handlePrint = () => {
    const el = document.getElementById('tax-summary-print');
    if (el) el.style.display = 'block';
    window.print();
    setTimeout(() => { if (el) el.style.display = 'none'; }, 1500);
  };

  const years = [String(now.getFullYear() - 1), String(now.getFullYear())];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <PoundSterling className="w-6 h-6 text-primary" />
            Owner Financial Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Rental income, expenses, and tax-ready monthly summaries</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Company filter */}
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month/Year selectors */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Tax Summary PDF
          </Button>
        </div>
      </div>

      {/* Period badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs px-3 py-1">
          Period: {MONTHS[parseInt(selectedMonth)]} {selectedYear}
        </Badge>
        {selectedCompany !== 'all' && (
          <Badge variant="outline" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            {companies.find(c => c.id === selectedCompany)?.name}
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Gross Rental Income</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{fmt(totalIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">Paid this month</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Allowable Expenses</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{fmt(totalExpenses)}</p>
                <p className="text-xs text-muted-foreground mt-1">Paid &amp; deductible</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Pending Expenses</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{fmt(totalPending)}</p>
                <p className="text-xs text-muted-foreground mt-1">Not yet deductible</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={netProfit >= 0 ? 'border-blue-200 bg-blue-50/40' : 'border-red-200 bg-red-50/40'}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Net Taxable Profit</p>
                <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{fmt(netProfit)}</p>
                <p className="text-xs text-muted-foreground mt-1">Income minus expenses</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${netProfit >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                <BarChart2 className={`w-5 h-5 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio-wide arrears banner */}
      {totalArrears > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-3 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Portfolio-wide outstanding arrears</span>
            </div>
            <span className="font-bold text-red-800 text-lg">{fmt(totalArrears)}</span>
          </CardContent>
        </Card>
      )}

      {/* 12-Month Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            12-Month Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt2(v)} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No transaction data available</p>
          )}
        </CardContent>
      </Card>

      {/* Net Profit Trend */}
      {monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Net Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt2(v)} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#0f4c81"
                  strokeWidth={2.5}
                  name="Net Profit"
                  dot={{ fill: '#0f4c81', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Expense breakdown for the month */}
      {expenseBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories — {MONTHS[parseInt(selectedMonth)]} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseBreakdown.map((item, i) => {
                const pct = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium truncate">{item.name}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">{fmt(item.value)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Income Table */}
      <PropertyIncomeTable transactions={monthTransactions} properties={properties} />

      {/* Pending Expenses Panel */}
      <PendingExpensesPanel transactions={filteredTransactions} propMap={propMap} />

      {/* Tax Summary Download CTA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-6 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Download Tax-Ready Summary</p>
              <p className="text-sm text-muted-foreground">
                A printable monthly P&L with full transaction log, expense categories, and pending items — ready for your accountant or HMRC self-assessment.
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} size="lg" className="gap-2 shrink-0">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </CardContent>
      </Card>

      {/* Empty state */}
      {transactions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <PoundSterling className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-semibold">No financial data yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add transactions in Financials to see your dashboard here.</p>
          </CardContent>
        </Card>
      )}

      {/* Hidden print component */}
      <TaxSummaryPrint
        data={printData}
        month={MONTHS[parseInt(selectedMonth)]}
        year={selectedYear}
        companyName={selectedCompany !== 'all' ? companies.find(c => c.id === selectedCompany)?.name : null}
      />
    </div>
  );
}