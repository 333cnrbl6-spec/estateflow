import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SampleDataBanner({ entity = "records" }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-800">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
      <p className="text-xs leading-relaxed">
        <span className="font-semibold">Sample data</span> — These {entity} are placeholder records to illustrate the layout. They have not been verified from a real source. Replace them with your actual data by editing or importing via the Setup page.
      </p>
    </div>
  );
}