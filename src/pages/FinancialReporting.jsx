import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FinancialReporting() {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [reportType, setReportType] = useState('profit_loss');
  const [period, setPeriod] = useState('12m');

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['financialReports', selectedCompany],
    queryFn: () =>
      selectedCompany
        ? base44.entities.FinancialReport.filter({ company_id: selectedCompany })
        : Promise.resolve([]),
    enabled: !!selectedCompany,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['portfolioMetrics', selectedCompany],
    queryFn: () =>
      selectedCompany
        ? base44.entities.PortfolioMetrics.filter({ company_id: selectedCompany })
        : Promise.resolve([]),
    enabled: !!selectedCompany,
  });

  const generateReportMutation = useMutation({
    mutationFn: (data) =>
      base44.functions.invoke('generateFinancialReport', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialReports', selectedCompany] });
      queryClient.invalidateQueries({ queryKey: ['portfolioMetrics', selectedCompany] });
    },
  });

  const chartData = metrics.map((m) => ({
    month: m.period_month,
    income: m.total_monthly_income,
    expenses: m.maintenance_costs + m.management_costs,
    profit: m.total_monthly_income - (m.maintenance_costs + m.management_costs),
    occupancy: m.occupied_units / m.total_units * 100,
  }));

  const summaryStats = reports[0] ? [
    { label: 'Total Income', value: `£${reports[0].total_income?.toLocaleString() || 0}` },
    { label: 'Total Expenses', value: `£${reports[0].total_expenses?.toLocaleString() || 0}` },
    { label: 'Net Profit', value: `£${reports[0].net_profit?.toLocaleString() || 0}`, isHighlight: true },
    { label: 'Occupancy Rate', value: `${reports[0].occupancy_rate || 0}%` },
  ] : [];

  return (
    <div className="p-8">
      <PageHeader
        title="Financial Reporting"
        subtitle="P&L statements, cash flow analysis, and portfolio performance metrics"
      >
        <Button
          onClick={() => generateReportMutation.mutate({ company_id: selectedCompany, report_type: reportType })}
          className="gap-2"
          disabled={!selectedCompany || generateReportMutation.isPending}
        >
          <FileDown className="w-4 h-4" />
          {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
        </Button>
      </PageHeader>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Company</label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                    <SelectItem value="cash_flow">Cash Flow</SelectItem>
                    <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                    <SelectItem value="portfolio_summary">Portfolio Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Period</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCompany && (
          <>
            <div className="grid grid-cols-4 gap-4">
              {summaryStats.map((stat, idx) => (
                <StatCard
                  key={idx}
                  label={stat.label}
                  value={stat.value}
                  isHighlight={stat.isHighlight}
                />
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>12-Month Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" fill="#16a34a" name="Income" />
                      <Bar dataKey="expenses" fill="#dc2626" name="Expenses" />
                      <Bar dataKey="profit" fill="#2563eb" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="occupancy" stroke="#2563eb" name="Occupancy %" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            {reports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{report.report_type.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{report.period_start} to {report.period_end}</p>
                        </div>
                        {report.file_url && (
                          <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}