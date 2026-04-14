import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';

export default function StepComplianceCheck({ data, onChange }) {
  const [checking, setChecking] = useState(false);

  const checkCompliance = async () => {
    setChecking(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Check regulatory status for ${data.company_name}: FCA regulated, redress scheme, client money protection, GDPR compliance. Return findings.`,
        add_context_from_internet: true,
        response_json_schema: SCHEMAS.complianceStatus,
      });
      onChange({ ...data, compliance_status: res });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Compliance Status</h2>
        <p className="text-sm text-muted-foreground mt-1">Verify regulatory requirements and compliance status.</p>
      </div>

      <Button onClick={checkCompliance} disabled={checking} className="w-full gap-2" variant="outline">
        {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
        Check Compliance Status
      </Button>

      {data.compliance_status && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm">FCA Regulated</span>
            <span className="font-semibold">{data.compliance_status.fca_regulated ? '✓ Yes' : '○ No'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm">Client Money Protection</span>
            <span className="font-semibold">{data.compliance_status.client_money_protection ? '✓ Yes' : '○ No'}</span>
          </div>
        </div>
      )}
    </div>
  );
}