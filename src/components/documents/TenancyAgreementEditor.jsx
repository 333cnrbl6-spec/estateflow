import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import AIDocumentDrafter from '@/components/documents/AIDocumentDrafter';
import FeatureGate from '@/components/shared/FeatureGate';
import { exportElementToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

export default function TenancyAgreementEditor({ property, tenant, startDate, rentAmount, depositAmount }) {
  const [content, setContent] = useState('');
  const contentRef = useRef(null);

  const handleDraftGenerated = (draft) => {
    setContent(`${draft.document_title}\n\n${draft.document_body}\n\n${'Key Clauses:\n' + draft.key_clauses.join('\n- ')}\n\n${draft.compliance_notes}`);
  };

  const handleExportPDF = async () => {
    try {
      await exportElementToPDF(contentRef, `Tenancy_${property?.name || 'Agreement'}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Tenancy Agreement</CardTitle>
            <div className="flex gap-2">
              <FeatureGate feature="ai_draft">
                <AIDocumentDrafter
                  documentType="Tenancy Agreement"
                  property={property}
                  tenant={tenant}
                  startDate={startDate}
                  rentAmount={rentAmount}
                  depositAmount={depositAmount}
                  onDraftGenerated={handleDraftGenerated}
                />
              </FeatureGate>

              <FeatureGate feature="pdf_export">
                <Button 
                  variant="outline" 
                  onClick={handleExportPDF}
                  disabled={!content}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </FeatureGate>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={contentRef} className="prose prose-sm max-w-none mb-4">
            {content ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 p-4 bg-slate-50 rounded border">
                {content}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Use the AI Draft button to generate a professional tenancy agreement, or enter your own text below.
              </p>
            )}
          </div>

          <Textarea
            placeholder="Or paste/edit your tenancy agreement here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-96 font-mono text-xs"
          />
        </CardContent>
      </Card>
    </div>
  );
}