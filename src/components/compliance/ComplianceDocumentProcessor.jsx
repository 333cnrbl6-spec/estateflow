import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const RISK_COLORS = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200'
};

const ACTION_ICONS = {
  none: CheckCircle,
  review: AlertTriangle,
  immediate: AlertTriangle,
  block: XCircle
};

const DOCUMENT_CATEGORIES = {
  tenancy_agreement: 'Tenancy Agreement',
  gas_safety_certificate: 'Gas Safety (CP12)',
  electrical_certificate: 'Electrical (EICR)',
  epc: 'Energy Performance Certificate',
  deposit_protection: 'Deposit Protection',
  right_to_rent: 'Right to Rent Check',
  hmo_license: 'HMO License',
  inspection_report: 'Inspection Report',
  section_21_notice: 'Section 21 Notice',
  section_8_notice: 'Section 8 Notice',
  financial_statement: 'Financial Statement',
  compliance_document: 'Compliance Document',
  other: 'Other'
};

export default function ComplianceDocumentProcessor({ onProcessed, documentType, context = {} }) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await processDocument(file_url);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const processDocument = async (file_url) => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('processComplianceDocument', {
        file_url,
        document_type: documentType,
        context
      });
      const resultData = response.data.data;
      setResult(resultData);
      
      // Show specific compliance feedback
      if (resultData.risk_level === 'critical') {
        toast.error('Critical compliance issues detected');
      } else if (resultData.risk_level === 'high') {
        toast.warning('High-risk compliance issues found');
      } else {
        toast.success('Document analysed successfully');
      }
      
      onProcessed?.(resultData, file_url);
    } catch (err) {
      toast.error('Analysis failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="p-6 border-slate-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">AI Compliance Document Processor</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Upload any document (PDF, DOCX, JPG, PNG, etc.) for AI-powered compliance analysis and auto-sorting.
        </p>

        {!result && (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
            {uploading || processing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Analysing with Claude Opus 4.6...'}
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">Choose file</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png" />
                </label>
                <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOCX, XLSX, CSV, JPG, PNG</p>
              </>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Risk & Action Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={RISK_COLORS[result.risk_level]}>
                Risk: {result.risk_level.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                Confidence: {Math.round(result.confidence_score * 100)}%
              </Badge>
              <Badge variant={result.action_required === 'none' ? 'default' : 'destructive'}>
                Action: {result.action_required.replace('_', ' ').toUpperCase()}
              </Badge>
              {result.content_category && (
                <Badge variant="secondary">
                  {DOCUMENT_CATEGORIES[result.content_category] || result.content_category}
                </Badge>
              )}
            </div>

            {/* Compliance Check Summary */}
            {result.compliance_check && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  UK Property Compliance Check
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {Object.entries(result.compliance_check).map(([key, value]) => {
                    if (value === null || value === undefined) return null;
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const isValid = value === true || (typeof value === 'string' && value !== '');
                    const isBoolean = typeof value === 'boolean';
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {isBoolean ? (
                          value ? (
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={isBoolean && !value ? 'text-red-600 font-medium' : 'text-slate-700'}>
                          {label}: {isBoolean ? (value ? '✓' : '✗') : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Missing Requirements */}
            {result.missing_requirements?.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Legal Requirements
                </h4>
                <ul className="space-y-1">
                  {result.missing_requirements.map((item, i) => (
                    <li key={i} className="text-sm text-red-700 flex gap-2">
                      <span>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expired Certificates */}
            {result.expired_certificates?.length > 0 && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Expired Certificates
                </h4>
                <ul className="space-y-1">
                  {result.expired_certificates.map((item, i) => (
                    <li key={i} className="text-sm text-orange-700 flex gap-2">
                      <span>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Actions */}
            {result.recommended_actions?.length > 0 && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Recommended Actions</h4>
                <ul className="space-y-1">
                  {result.recommended_actions.map((action, i) => (
                    <li key={i} className="text-sm text-blue-700 flex gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regulatory References */}
            {result.regulatory_references?.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Regulatory Framework:</p>
                <div className="flex flex-wrap gap-2">
                  {result.regulatory_references.map((ref, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                Process Another Document
              </Button>
              {result.auto_sort_destination && (
                <Button size="sm" onClick={() => toast.success(`Routing to ${result.auto_sort_destination}`)}>
                  Auto-Sort Document
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}