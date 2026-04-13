import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import IncomeExpenseChart from '@/components/reporting/IncomeExpenseChart';
import OccupancyTrendChart from '@/components/reporting/OccupancyTrendChart';
import MaintenanceCostBreakdown from '@/components/reporting/MaintenanceCostBreakdown';
import MonthlyReportGenerator from '@/components/reporting/MonthlyReportGenerator';
import { FileText, Download, Loader2, Calendar } from 'lucide-react';

export default function LandlordMonthlyReporting() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generating, setGenerating] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => base44.entities.Property.list('-updated_date', 100),
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions', selectedProperty, selectedMonth],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(selectedMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      const endStr = endDate.toISOString().slice(0, 10);
      
      return base44.entities.FinancialTransaction.filter({
        property_id: selectedProperty,
      });
    },
    enabled: !!selectedProperty,
  });

  const { data: maintenance = [], isLoading: loadingMaintenance } = useQuery({
    queryKey: ['maintenance', selectedProperty, selectedMonth],
    queryFn: async () => {
      if (!selectedProperty) return [];
      return base44.entities.MaintenanceRequest.filter({
        property_id: selectedProperty,
      });
    },
    enabled: !!selectedProperty,
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      return base44.entities.Unit.filter({ property_id: selectedProperty });
    },
    enabled: !!selectedProperty,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', selectedProperty],
    queryFn: async () => {
      if (!selectedProperty) return [];
      return base44.entities.Tenant.filter({ property_id: selectedProperty });
    },
    enabled: !!selectedProperty,
  });

  const metrics = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const monthStart = new Date(year, parseInt(month) - 1, 1);
    const monthEnd = new Date(year, parseInt(month), 0);

    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.created_date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income' || t.type === 'rent_received')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense' || t.type === 'service_charge')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const monthlyMaintenance = maintenance.filter(t => {
      const tDate = new Date(t.completion_date || t.created_date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const maintenanceCost = monthlyMaintenance.reduce((sum, m) => sum + (m.actual_cost || m.estimated_cost || 0), 0);

    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const occupancyRate = units.length > 0 ? (occupiedUnits / units.length * 100).toFixed(1) : 0;

    return {
      income,
      expenses,
      maintenanceCost,
      occupiedUnits,
      totalUnits: units.length,
      occupancyRate,
      profit: income - expenses,
    };
  }, [transactions, maintenance, units, selectedMonth]);

  const handleGeneratePDF = async () => {
    if (!selectedProperty) return;
    setGenerating(true);
    try {
      await base44.functions.invoke('generateMonthlyPropertyReport', {
        property_id: selectedProperty,
        month: selectedMonth,
      });
    } finally {
      setGenerating(false);
    }
  };

  const loading = loadingTransactions || loadingMaintenance;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Property Reports"
        subtitle="Generate automated summaries with income, expenses, and occupancy metrics"
        action={
          <Button onClick={handleGeneratePDF} disabled={!selectedProperty || generating} className="gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generate PDF Report
          </Button>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Property</label>
          <Select value={selectedProperty || ''} onValueChange={setSelectedProperty}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a property..." />
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const val = d.toISOString().slice(0, 7);
                return <SelectItem key={val} value={val}>{new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedProperty ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a property to view its monthly report</p>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Income</p>
                <p className="text-2xl font-bold text-green-600">£{metrics.income.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Expenses</p>
                <p className="text-2xl font-bold text-red-600">£{metrics.expenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Profit</p>
                <p className={`text-2xl font-bold ${metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{metrics.profit.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Occupancy</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.occupancyRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.occupiedUnits}/{metrics.totalUnits} units</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseChart transactions={transactions} month={selectedMonth} />
            <OccupancyTrendChart tenants={tenants} units={units} />
          </div>

          {/* Maintenance Breakdown */}
          <MaintenanceCostBreakdown maintenance={maintenance} month={selectedMonth} />

          {/* PDF Generation Component */}
          <MonthlyReportGenerator
            property={properties.find(p => p.id === selectedProperty)}
            month={selectedMonth}
            metrics={metrics}
            transactions={transactions}
            maintenance={maintenance}
          />
        </>
      )}
    </div>
  );
}