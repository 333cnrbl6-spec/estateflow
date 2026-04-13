import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CashFlowStatement from '@/components/reporting/CashFlowStatement';
import PropertyProfitLoss from '@/components/reporting/PropertyProfitLoss';
import TaxReadySummary from '@/components/reporting/TaxReadySummary';
import ReportExporter from '@/components/reporting/ReportExporter';
import PageHeader from '@/components/shared/PageHeader';
import { Calendar, Download } from 'lucide-react';

export default function FinancialReportingModule() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedProperties, setSelectedProperties] = useState([]);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: financialData, isLoading: isCalculating } = useQuery({
    queryKey: ['financial-report', selectedMonth, selectedProperties],
    queryFn: () =>
      base44.functions.invoke('generateFinancialReport', {
        month: selectedMonth,
        propertyIds: selectedProperties.length > 0 ? selectedProperties : properties.map(p => p.id),
      }),
    enabled: properties.length > 0,
  });

  const togglePropertyFilter = (propertyId) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
      );
  };

  const toggleAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Financial Reporting"
        description="Comprehensive financial analysis and tax-ready reports"
        icon="BarChart3"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Period & Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Month</label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Properties</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllProperties}
                className="text-xs"
              >
                {selectedProperties.length === properties.length ? 'Clear All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {properties.map(property => (
                <label key={property.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => togglePropertyFilter(property.id)}
                    className="rounded"
                  />
                  <span className="text-sm truncate">{property.name}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      {isCalculating && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Calculating financial metrics...</p>
        </Card>
      )}

      {!isCalculating && financialData && (
        <>
          <Tabs defaultValue="cash-flow" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
              <TabsTrigger value="profit-loss">P&L by Property</TabsTrigger>
              <TabsTrigger value="tax-summary">Tax Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="cash-flow">
              <CashFlowStatement data={financialData.cashFlow} month={selectedMonth} />
            </TabsContent>

            <TabsContent value="profit-loss">
              <PropertyProfitLoss data={financialData.profitLoss} month={selectedMonth} />
            </TabsContent>

            <TabsContent value="tax-summary">
              <TaxReadySummary data={financialData.taxSummary} month={selectedMonth} />
            </TabsContent>
          </Tabs>

          {/* Export */}
          <ReportExporter
            data={financialData}
            month={selectedMonth}
            properties={properties.filter(p => selectedProperties.length === 0 || selectedProperties.includes(p.id))}
          />
        </>
      )}
    </div>
  );
}