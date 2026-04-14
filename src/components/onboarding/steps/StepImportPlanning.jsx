import React from 'react';
import { Check } from 'lucide-react';

export default function StepImportPlanning({ data }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Prepare for Import</h2>
        <p className="text-sm text-muted-foreground mt-1">Based on predictions, gather your data from the sources identified.</p>
      </div>

      {data.data_prediction?.likely_storage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-sm text-amber-900">Check these locations for your data:</p>
          {data.data_prediction.likely_storage.map((loc, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">{loc}</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-slate-600">
        <p>Estimated time to gather & import: <strong>~{data.data_prediction?.estimated_hours || 3}-4 hours</strong></p>
        <p className="mt-2">Complexity: <strong>{data.data_prediction?.import_complexity || 'Medium'}</strong></p>
      </div>
    </div>
  );
}