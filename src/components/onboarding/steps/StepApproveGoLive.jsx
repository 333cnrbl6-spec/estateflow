import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function StepApproveGoLive({ data, onBuild, building, buildResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Ready to Go Live</h2>
        <p className="text-sm text-muted-foreground mt-1">Review and create your environment.</p>
      </div>

      <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
        <div className="flex justify-between py-1 border-b">
          <span className="text-sm">Company</span>
          <span className="font-medium text-slate-800">{data.company_name}</span>
        </div>
        {data.business_profile?.services && (
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm">Services</span>
            <span className="font-medium text-slate-800">{data.business_profile.services.length} services</span>
          </div>
        )}
        {data.data_prediction && (
          <div className="flex justify-between py-1 border-b">
            <span className="text-sm">Data to Import</span>
            <span className="font-medium text-slate-800">~{data.data_prediction.estimated_properties} properties</span>
          </div>
        )}
      </div>

      {!buildResult && (
        <Button onClick={onBuild} disabled={building} size="lg" className="w-full gap-2">
          {building ? <><Loader2 className="w-4 h-4 animate-spin" /> Building...</> : <><Sparkles className="w-4 h-4" /> Create Environment</>}
        </Button>
      )}

      {buildResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-800">Environment created!</p>
          </div>
          <p className="text-sm text-green-700 mt-2">Your Premiso environment is ready. You can now start importing data or use demo data to explore.</p>
        </div>
      )}
    </div>
  );
}