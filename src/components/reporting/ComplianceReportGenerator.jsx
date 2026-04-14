import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';

export default function ComplianceReportGenerator({ propertyId, propertyName }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerateReport = async (format = 'json') => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateComplianceReport', {
        property_id: propertyId,
        format_type: format
      });

      setGenerated({
        timestamp: new Date().toISOString(),
        format,
        data: response.data
      });

      // If PDF, trigger download
      if (format === 'pdf') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-report-${propertyId}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
      }
    } catch (err) {
      console.error('Report generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Compliance Report
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Generate a comprehensive compliance report for {propertyName || 'this property'} including certificates, inspections, and alerts.
      </p>

      <div className="flex gap-2">
        <Button
          onClick={() => handleGenerateReport('json')}
          disabled={loading}
          variant="outline"
          className="flex-1"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          JSON Export
        </Button>
        <Button
          onClick={() => handleGenerateReport('pdf')}
          disabled={loading}
          className="flex-1"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          PDF Download
        </Button>
      </div>

      {generated && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Report generated at {new Date(generated.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}