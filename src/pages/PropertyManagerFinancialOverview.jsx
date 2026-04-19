import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, AlertCircle, Download, Loader2, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

export default function PropertyManagerFinancialOverview() {
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      loadFinancialData();
    }
  }, [selectedPropertyId, selectedMonth]);

  const loadProperties = async () => {
    try {
      const data = await base44.entities.Property.list();
      setProperties(data || []);
      if (data?.length > 0) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (err) {
      toast.error('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialData = async () => {
    if (!selectedPropertyId) return;

    setLoading(true);
    try {
      const [tenants, financialTransactions, maintenanceOrders] = await Promise.all([
        base44.entities.Tenant.filter({ property_id: selectedPropertyId, status: 'active' }),
        base44.entities.FinancialTransaction.filter({ property_id: selectedPropertyId }),
        base44.entities.MaintenanceOrder.filter({ property_id: selectedPropertyId })
      ]);

      const monthStart = new Date(`${selectedMonth}-01`);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      // Calculate income
      const rentalIncome = (financialTransactions || [])
        .filter(t => 
          t.type === 'rent_payment' &&
          new Date(t.transaction_date) >= monthStart &&
          new Date(t.transaction_date) < monthEnd
        )
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calculate overdue payments
      const overdueTransactions = (financialTransactions || [])
        .filter(t => 
          t.type === 'rent_payment' &&
          t.status === 'overdue'
        );

      const overdueAmount = overdueTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calculate maintenance expenses
      const maintenanceExpenses = (maintenanceOrders || [])
        .filter(m => 
          m.status === 'completed' &&
          m.completion_date &&
          new Date(m.completion_date) >= monthStart &&
          new Date(m.completion_date) < monthEnd
        )
        .reduce((sum, m) => sum + (m.total_cost || 0), 0);

      // Get historical data for charts
      const last12Months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last12Months.push({
          month: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
          monthKey: d.toISOString().slice(0, 7)
        });
      }

      const incomeData = last12Months.map(m => {
        const transactions = (financialTransactions || []).filter(t =>
          t.type === 'rent_payment' &&
          t.status === 'completed' &&
          t.transaction_date?.startsWith(m.monthKey)
        );
        return {
          month: m.month,
          income: transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / 100,
          expected: tenants?.length * 500 || 0 // placeholder
        };
      });

      const expenseData = last12Months.map(m => {
        const expenses = (maintenanceOrders || []).filter(o =>
          o.status === 'completed' &&
          o.completion_date?.startsWith(m.monthKey)
        );
        return {
          month: m.month,
          maintenance: expenses.reduce((sum, e) => sum + (e.total_cost || 0), 0) / 100,
          utilities: 150 // placeholder
        };
      });

      setFinancialData({
        rentalIncome,
        overdueAmount,
        overdueCount: overdueTransactions.length,
        maintenanceExpenses,
        tenantCount: tenants?.length || 0,
        incomeData,
        expenseData,
        selectedMonth
      });
    } catch (err) {
      toast.error('Error loading financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportStatement = async () => {
    if (!selectedPropertyId) {
      toast.error('Please select a property');
      return;
    }

    setExporting(true);
    try {
      const response = await base44.functions.invoke('generatePropertyMonthlyStatement', {
        propertyId: selectedPropertyId,
        month: selectedMonth
      });

      if (response.data.success && response.data.download_url) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = `Statement_${selectedMonth}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Statement exported successfully');
      } else {
        throw new Error(response.data.error || 'Export failed');
      }
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !financialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Financial Overview</h1>
        <p className="text-muted-foreground">Monitor rental income, expenses, and overdue payments</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Property</label>
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleExportStatement} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Statement
          </Button>
        </div>
      </div>

      {financialData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rental Income</p>
                    <p className="text-2xl font-bold">£{(financialData.rentalIncome / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">{financialData.tenantCount} active tenants</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Overdue Payments</p>
                    <p className="text-2xl font-bold">£{(financialData.overdueAmount / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">{financialData.overdueCount} payments</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Maintenance Costs</p>
                    <p className="text-2xl font-bold">£{(financialData.maintenanceExpenses / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">This month</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Net Income</p>
                    <p className="text-2xl font-bold">
                      £{((financialData.rentalIncome - financialData.maintenanceExpenses) / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Income - Expenses</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rental Income Trend</CardTitle>
                <CardDescription>Last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData.incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      dot={{ fill: '#10b981' }}
                      name="Received"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expected" 
                      stroke="#d1d5db" 
                      strokeDasharray="5 5"
                      name="Expected"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData.expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" />
                    <Bar dataKey="utilities" fill="#8b5cf6" name="Utilities" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}