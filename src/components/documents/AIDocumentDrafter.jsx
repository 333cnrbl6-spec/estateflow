import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, AlertTriangle, CheckCircle, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useStripeTier } from '@/hooks/useStripeTier';
import { exportTextToPDF } from '@/utils/pdfExport';

const DOC_TYPE_LABELS = {
  tenancy_agreement: 'Assured Shorthold Tenancy Agreement',
  inspection_report: 'Property Inspection Report',
  section_21: 'Section 21 Notice (No-Fault Eviction)',
  section_8: 'Section 8 Notice (Ground for Possession)',
  rent_review: 'Rent Review Letter',
};

export default function AIDocumentDrafter({ 
  documentType = 'tenancy_agreement',
  property, 
  tenant, 
  startDate, 
  rentAmount, 
  depositAmount,
  onDraftGenerated 
}) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [showDraft, setShowDraft] = useState(false);
  const { canAccessAIDraft } = useStripeTier();

  if (!canAccessAIDraft) {
    return (
      <Button variant="outline" disabled className="gap-2 opacity-60">
        <Wand2 className="w-4 h-4" />
        AI Draft — Pro Feature
      </Button>
    );
  }

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const docLabel = DOC_TYPE_LABELS[documentType] || documentType;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a UK property law expert. Generate a professional ${docLabel} for:
Property: ${property?.name || 'TBC'}, ${property?.address_line_1 || ''}, ${property?.postcode || ''}
Landlord: ${property?.owning_company || 'The Landlord'}
Tenant: ${tenant?.full_name || 'The Tenant'}
Tenancy Start: ${startDate || 'As agreed'}
Monthly Rent: £${rentAmount || '0'}
Deposit: £${depositAmount || '0'}

Include ALL UK housing law obligations: Housing Act 1988, Deregulation Act 2015, Tenant Fees Act 2019, How to Rent guide requirement, EPC requirement, gas safety cert requirement, deposit protection (Housing Act 2004 s.213-215). Flag any compliance requirements as legal warnings. Be thorough and professional.`,
        response_json_schema: {
          type: 'object',
          properties: {
            document_title: { type: 'string' },
            document_body: { type: 'string' },
            key_clauses: { type: 'array', items: { type: 'string' } },
            compliance_notes: { type: 'string' },
            legal_warnings: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setDraft(result);
      setShowDraft(true);
      onDraftGenerated?.(result);
      toast.success('AI draft generated successfully');
    } catch (error) {
      toast.error('Failed to generate draft: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!draft) return;
    exportTextToPDF(draft.document_title, draft.document_body, property);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button onClick={handleGenerateDraft} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? 'Generating AI Draft...' : 'AI Draft'}
        </Button>
        {draft && (
          <Button variant="outline" onClick={() => setShowDraft(v => !v)} className="gap-2">
            {showDraft ? 'Hide' : 'View'} Draft
          </Button>
        )}
      </div>

      {showDraft && draft && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">{draft.document_title}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportPDF} className="gap-1">
                <Download className="w-3 h-3" /> Export PDF
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setShowDraft(false)}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft.legal_warnings?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Legal Warnings
                </p>
                {draft.legal_warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">• {w}</p>
                ))}
              </div>
            )}

            <div className="bg-white border rounded p-4 max-h-80 overflow-y-auto">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{draft.document_body}</pre>
            </div>

            {draft.key_clauses?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Key Clauses</p>
                <div className="flex flex-wrap gap-1">
                  {draft.key_clauses.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {draft.compliance_notes && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-xs font-semibold text-green-800 flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3" /> Compliance Notes
                </p>
                <p className="text-xs text-green-700">{draft.compliance_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}