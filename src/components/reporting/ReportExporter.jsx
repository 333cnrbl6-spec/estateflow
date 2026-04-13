import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ReportExporter({ data, month, properties }) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    try {
      const rows = [];
      
      // Header
      rows.push(['Financial Report', month].join(','));
      rows.push('');

      // Cash Flow Summary
      rows.push('CASH FLOW STATEMENT');
      rows.push(['Category', 'Amount'].join(','));
      rows.push(['Total Inflows', data.cashFlow.summary.totalInflows.toFixed(2)].join(','));
      rows.push(['Total Outflows', data.cashFlow.summary.totalOutflows.toFixed(2)].join(','));
      rows.push(['Net Cash Flow', data.cashFlow.summary.netCashFlow.toFixed(2)].join(','));
      rows.push('');

      // P&L by Property
      rows.push('PROFIT & LOSS BY PROPERTY');
      rows.push(['Property', 'Revenue', 'Expenses', 'Profit', 'Margin %'].join(','));
      data.profitLoss.properties.forEach(prop => {
        rows.push([
          `"${prop.name}"`,
          prop.revenue.toFixed(2),
          prop.expenses.toFixed(2),
          prop.profit.toFixed(2),
          prop.margin.toFixed(2)
        ].join(','));
      });
      rows.push('');

      // Tax Summary
      rows.push('TAX SUMMARY');
      rows.push(['Item', 'Amount'].join(','));
      rows.push(['Taxable Income', data.taxSummary.summary.taxableIncome.toFixed(2)].join(','));
      rows.push(['Allowable Expenses', data.taxSummary.summary.allowableExpenses.toFixed(2)].join(','));
      rows.push(['Taxable Profit', data.taxSummary.summary.taxableProfit.toFixed(2)].join(','));
      rows.push(['Est. Tax @ 20%', (data.taxSummary.summary.taxableProfit * 0.2).toFixed(2)].join(','));

      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Financial-Report-${month}.csv`;
      link.click();
      
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const result = await base44.functions.invoke('generateFinancialReportPDF', {
        data,
        month,
        properties: properties.map(p => ({ id: p.id, name: p.name })),
      });

      if (result.html) {
        const newWindow = window.open();
        newWindow.document.write(result.html);
        newWindow.document.close();
        newWindow.print();
        toast.success('PDF ready for download via print dialog');
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Export Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={exportToCSV}
            disabled={exporting}
            className="gap-2"
            variant="outline"
          >
            <Table className="w-4 h-4" />
            Export as CSV
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          CSV format for spreadsheet analysis. PDF for formal reporting and tax submission.
        </p>
      </CardContent>
    </Card>
  );
}