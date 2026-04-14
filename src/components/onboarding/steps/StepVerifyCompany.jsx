import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Circle, Loader2, ExternalLink } from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';

export default function StepVerifyCompany({ data, onChange }) {
  const [fetching, setFetching] = useState(false);

  const fetchOfficers = async () => {
    if (!data.company_number) return;
    setFetching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `From Companies House for ${data.company_number}, fetch all directors with: name, role, appointed_date, nationality.`,
        add_context_from_internet: true,
        response_json_schema: SCHEMAS.fetchDirectors,
      });
      onChange({ ...data, directors: res.directors || [], officers_fetched: true });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Officers & Directors</h2>
        <p className="text-sm text-muted-foreground mt-1">Verify officers and select who should have admin access.</p>
      </div>

      {data.company_number && !data.officers_fetched && (
        <Button onClick={fetchOfficers} disabled={fetching} className="w-full gap-2" variant="outline">
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Fetch Officers from Companies House
        </Button>
      )}

      {(data.directors || []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Directors</p>
          {data.directors.map((d, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Circle className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}