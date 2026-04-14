import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';

export default function StepAssociatedEntities({ data, onChange }) {
  const [finding, setFinding] = useState(false);

  const findAssociated = async () => {
    if (!data.company_number) return;
    setFinding(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find companies associated with ${data.company_number} (sister companies, group entities, shared officers). Return top 5 with company_name and company_number.`,
        add_context_from_internet: true,
        response_json_schema: SCHEMAS.findAssociatedCompanies,
      });
      onChange({ ...data, associated_companies: res.associated || [] });
    } finally {
      setFinding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Associated Companies</h2>
        <p className="text-sm text-muted-foreground mt-1">Discover sister companies or group entities to manage together.</p>
      </div>

      <Button onClick={findAssociated} disabled={finding} className="w-full gap-2" variant="outline">
        {finding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Find Associated Companies
      </Button>

      {(data.associated_companies || []).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">{data.associated_companies.length} companies found</p>
          {data.associated_companies.map((c, i) => (
            <div key={i} className="text-sm text-blue-800">{c.company_name}</div>
          ))}
        </div>
      )}
    </div>
  );
}