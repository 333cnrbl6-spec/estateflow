import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2 } from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';

export default function StepDataProfile({ data, onChange }) {
  const [predicting, setPredicting] = useState(false);

  const predictDataProfile = async () => {
    setPredicting(true);
    try {
      const services = (data.business_profile?.services || []).join(', ');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For a company offering: ${services}, predict what data they likely have: properties/units count estimate, tenants estimate, financial records period, likely storage locations (Xero, Google Drive, email, etc.). Be specific with estimates.`,
        response_json_schema: SCHEMAS.dataProfilePrediction,
      });
      onChange({ ...data, data_prediction: res });
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Data Profile Prediction</h2>
        <p className="text-sm text-muted-foreground mt-1">Predict what data you likely have based on your business.</p>
      </div>

      <Button onClick={predictDataProfile} disabled={predicting} className="w-full gap-2" variant="outline">
        {predicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        Predict Data Profile
      </Button>

      {data.data_prediction && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-muted-foreground">Properties</p>
            <p className="text-lg font-bold text-blue-700">~{data.data_prediction.estimated_properties}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-muted-foreground">Tenants</p>
            <p className="text-lg font-bold text-blue-700">~{data.data_prediction.estimated_tenants}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded col-span-2">
            <p className="text-xs text-muted-foreground">Likely Storage</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(data.data_prediction.likely_storage || []).map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}