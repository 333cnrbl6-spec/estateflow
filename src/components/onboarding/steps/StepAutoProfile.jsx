import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2 } from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';

export default function StepAutoProfile({ data, onChange }) {
  const [gathering, setGathering] = useState(false);

  const gatherBusinessIntel = async () => {
    setGathering(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For ${data.company_name}, research public web data to find: services offered, estimated portfolio size, locations, technology stack, reputation. Return structured data.`,
        add_context_from_internet: true,
        response_json_schema: SCHEMAS.businessProfile,
      });
      onChange({ ...data, business_profile: res });
    } finally {
      setGathering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Business Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Auto-gather public business intelligence.</p>
      </div>

      <Button onClick={gatherBusinessIntel} disabled={gathering} className="w-full gap-2" variant="outline">
        {gathering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
        Gather Business Intelligence
      </Button>

      {data.business_profile && (
        <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
          {data.business_profile.services && (
            <div>
              <p className="text-xs text-muted-foreground">Services</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.business_profile.services.map((s, i) => (
                  <Badge key={i} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {data.business_profile.locations && (
            <div>
              <p className="text-xs text-muted-foreground">Locations</p>
              <p className="text-sm font-medium">{data.business_profile.locations.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}