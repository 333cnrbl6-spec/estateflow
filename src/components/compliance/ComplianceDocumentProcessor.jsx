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
      toast.success('Document analysed successfully');
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
            <div className="flex items-center gap-3">
              <Badge className={RISK_COLORS[result.risk_level]}>
                Risk: {result.risk_level.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                Confidence: {Math.round(result.confidence_score * 100)}%
              </Badge>
              <Badge variant={result.action_required === 'none' ? 'default' : 'destructive'}>
                Action: {result.action_required.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">File Type</p>
                <p className="font-medium">{result.file_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{result.content_category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Auto-Sort To</p>
                <p className="font-medium">{result.auto_sort_destination || 'Manual review'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Action Icon</p>
                {(() => {
                  const ActionIcon = ACTION_ICONS[result.action_required];
                  return ActionIcon ? <ActionIcon className="w-5 h-5" /> : null;
                })()}
              </div>
            </div>

            {result.recommended_actions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Recommended Actions</p>
                <ul className="space-y-1">
                  {result.recommended_actions.map((action, i) => (
                    <li key={i} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-primary">•</span> {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => setResult(null)}>
              Process Another Document
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}