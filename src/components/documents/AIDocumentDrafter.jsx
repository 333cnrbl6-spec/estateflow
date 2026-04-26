import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStripeTier } from '@/hooks/useStripeTier';

export default function AIDocumentDrafter({ 
  documentType, 
  property, 
  tenant, 
  startDate, 
  rentAmount, 
  depositAmount,
  onDraftGenerated 
}) {
  const [loading, setLoading] = useState(false);
  const { canAccessAIDraft } = useStripeTier();

  if (!canAccessAIDraft) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Wand2 className="w-4 h-4" />
        AI Draft (Pro+)
      </Button>
    );
  }

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const prompt = `You are a UK property law expert. Generate a professional ${documentType} for:
Property: ${property?.name || 'TBC'}, ${property?.address_line_1 || ''}
Landlord: ${property?.owning_company || 'TBC'}
Tenant: ${tenant?.full_name || 'TBC'}
Tenancy Start: ${startDate}
Monthly Rent: £${rentAmount}
Deposit: £${depositAmount}

Include all UK Housing Act 2004 obligations, section 213 deposit protection, prescribed information, and ensure compliance with current legislation. Format as professional document.`;

      const draft = await base44.integrations.Core.InvokeLLM({
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

      onDraftGenerated?.(draft);
      toast.success('AI draft generated successfully');
    } catch (error) {
      toast.error('Failed to generate draft: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateDraft} 
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
      {loading ? 'Generating...' : 'AI Draft'}
    </Button>
  );
}