import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2, Check } from 'lucide-react';

export default function MonthlyReportGenerator({ property, month, metrics, transactions, maintenance }) {
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const generatePDF = async () => {
    if (!property) return;
    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await base44.functions.invoke('generateMonthlyPropertyReport', {
        property_id: property.id,
        month: month,
        metrics: JSON.stringify(metrics),
        transactionCount: transactions.length,
        maintenanceCount: maintenance.length,
      });

      if (response.data?.pdf_url) {
        // Open PDF in new window
        window.open(response.data.pdf_url, '_blank');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const monthName = new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generate Monthly PDF Report
        </CardTitle>
        <CardDescription>
          Create a professional PDF summary for {property?.name} - {monthName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">Report generated successfully!</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold">£{metrics.income.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold">£{metrics.expenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Maintenance Costs</p>
            <p className="text-lg font-bold">£{metrics.maintenanceCost.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className="text-lg font-bold">{metrics.profit >= 0 ? '£' : '-£'}{Math.abs(metrics.profit).toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Report will include income/expense trends, occupancy metrics, and maintenance cost breakdown.
        </p>

        <Button onClick={generatePDF} disabled={generating} className="w-full gap-2">
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Download PDF Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}