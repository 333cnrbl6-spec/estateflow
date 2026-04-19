import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function AIDraftButton({ documentType, context = {}, className }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const typeLabels = {
    tenancy_agreement: 'Tenancy Agreement',
    inspection_report: 'Inspection Report',
    section_21_notice: 'Section 21 Notice',
    section_8_notice: 'Section 8 Notice',
    rent_increase_notice: 'Rent Increase Notice',
  };

  const label = typeLabels[documentType] || documentType;

  const generate = async () => {
    setLoading(true);
    setResult(null);

    const { address, landlord, tenant, startDate, rent, deposit } = context;
    const prompt = `You are a UK property law expert. Generate a professional ${label} for:
Property: ${address || 'UK Property'}
Landlord: ${landlord || 'The Landlord'}
Tenant: ${tenant || 'The Tenant'}
Start Date: ${startDate || 'as agreed'}
Rent: £${rent || 'as agreed'}/month
Deposit: £${deposit || 'as agreed'}

Include all UK housing law obligations, statutory requirements, and relevant legislation references (Housing Act 1988, Landlord and Tenant Act 1985, etc.). Make it professional and legally comprehensive.`;

    const doc = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          document_title: { type: 'string' },
          document_body: { type: 'string' },
          key_clauses: { type: 'array', items: { type: 'string' } },
          compliance_notes: { type: 'string' }
        }
      }
    });

    setResult(doc);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    generate();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.document_body);
    toast.success('Document copied to clipboard');
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(result.document_body, 170);
    pdf.setFontSize(16);
    pdf.text(result.document_title, 20, 20);
    pdf.setFontSize(10);
    let y = 35;
    lines.forEach(line => {
      if (y > 275) { pdf.addPage(); y = 20; }
      pdf.text(line, 20, y);
      y += 5;
    });
    pdf.save(`${result.document_title?.replace(/\s+/g, '_') || 'document'}.pdf`);
    toast.success('PDF downloaded');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen} className={`gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 ${className}`}>
        <Sparkles className="w-4 h-4" />
        AI Draft
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Generated {label}
            </DialogTitle>
            <DialogDescription>
              Generated using UK property law expertise. Review before use.
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm text-muted-foreground">Drafting your {label}...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-1">
                  <Download className="w-3 h-3" /> Download PDF
                </Button>
              </div>

              {/* Document body */}
              <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {result.document_body}
              </div>

              {/* Key clauses */}
              {result.key_clauses?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Key Clauses</p>
                  <ul className="space-y-1">
                    {result.key_clauses.map((c, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-green-600 mt-0.5">✓</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance notes */}
              {result.compliance_notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Compliance Notes</p>
                  <p className="text-sm text-amber-700">{result.compliance_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}