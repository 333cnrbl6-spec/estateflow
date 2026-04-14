import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplianceReportGenerator({ properties = [], certificates = [], maintenance = [] }) {
  const [loading, setLoading] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const response = await base44.functions.invoke('generateComplianceReportPDF', {
        propertyIds: selectedProperties.length > 0 ? selectedProperties : properties.map(p => p.id)
      });

      if (response.data) {
        // Trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Compliance report generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const now = new Date();
  const expiringSoon = certificates.filter(cert => {
    const expiry = new Date(cert.expiry_date);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  const expired = certificates.filter(cert => {
    const expiry = new Date(cert.expiry_date);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    return daysLeft <= 0;
  }).length;

  const maintenanceSpend = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Compliance Report Generator
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate PDF reports summarizing certificates, insurance, and maintenance trends
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Certificates</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{certificates.length}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">Expiring Soon</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{expiringSoon}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">Expired</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{expired}</p>
        </div>
      </div>

      {/* Property Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Select Properties (leave empty for all)
        </label>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50">
          {properties.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2">No properties available</p>
          ) : (
            properties.map(prop => (
              <label key={prop.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(prop.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProperties([...selectedProperties, prop.id]);
                    } else {
                      setSelectedProperties(selectedProperties.filter(id => id !== prop.id));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-foreground">{prop.address?.split(',')[0]}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
        <h4 className="font-medium text-foreground mb-3">Report Summary</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              <strong>{properties.length}</strong> properties will be included
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              Summary of <strong>{certificates.length}</strong> safety certificates
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              <strong>{expiringSoon}</strong> certificates expiring within 30 days
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              6-month maintenance spend: <strong>£{(maintenanceSpend / 100).toFixed(2)}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              Insurance policy status and expiration timeline
            </span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleGenerateReport}
        disabled={loading}
        className="w-full gap-2"
      >
        <Download className="w-4 h-4" />
        {loading ? 'Generating Report...' : 'Generate & Download PDF Report'}
      </Button>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Reports include certificate expirations, insurance updates, and maintenance spend trends
      </p>
    </Card>
  );
}