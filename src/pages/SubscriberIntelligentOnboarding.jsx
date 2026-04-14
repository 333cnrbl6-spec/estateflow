import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2, Users, CheckCircle2, Loader2, Sparkles, FileText, Globe,
  HardDrive, Database, AlertCircle, Check,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { SCHEMAS } from '@/lib/llmSchemas';
import StepCompanyLookup from '@/components/onboarding/steps/StepCompanyLookup';
import StepVerifyCompany from '@/components/onboarding/steps/StepVerifyCompany';
import StepAssociatedEntities from '@/components/onboarding/steps/StepAssociatedEntities';
import StepAutoProfile from '@/components/onboarding/steps/StepAutoProfile';
import StepComplianceCheck from '@/components/onboarding/steps/StepComplianceCheck';
import StepDataProfile from '@/components/onboarding/steps/StepDataProfile';
import StepImportPlanning from '@/components/onboarding/steps/StepImportPlanning';
import StepApproveGoLive from '@/components/onboarding/steps/StepApproveGoLive';

const STEPS = [
  { id: 'company_lookup', label: 'Find Company', icon: Search },
  { id: 'verify_company', label: 'Verify & Officers', icon: Users },
  { id: 'associated_entities', label: 'Associated Companies', icon: Building2 },
  { id: 'auto_profile', label: 'Business Profile', icon: Globe },
  { id: 'compliance_check', label: 'Compliance Status', icon: AlertCircle },
  { id: 'data_profile', label: 'Data Prediction', icon: Database },
  { id: 'import_planning', label: 'Import Planning', icon: FileText },
  { id: 'data_gathering', label: 'Gather Data', icon: HardDrive },
  { id: 'cleanse_stage', label: 'Cleanse & Stage', icon: Loader2 },
  { id: 'approve_go_live', label: 'Go Live', icon: CheckCircle2 },
];



export default function SubscriberIntelligentOnboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState(null);

  const canContinue = () => {
    if (step === 0) return !!formData.company_name;
    return true;
  };

  const build = async () => {
    setBuilding(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a summary for new Premiso environment for: ${formData.company_name}, Services: ${formData.business_profile?.services?.join(', ')}, Estimated data: ${formData.data_prediction?.estimated_properties} properties`,
        response_json_schema: SCHEMAS.environmentSummary,
      });
      setBuildResult(res);
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Intelligent Onboarding
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Premiso</h1>
          <p className="text-muted-foreground mt-1">Auto-populated company research-driven setup</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  done ? 'bg-green-100 text-green-700' :
                  active ? 'bg-primary text-primary-foreground' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-3 shrink-0 ${i < step ? 'bg-green-300' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 min-h-[400px] flex flex-col">
          <div className="flex-1">
            {step === 0 && <StepCompanyLookup data={formData} onChange={setFormData} />}
            {step === 1 && <StepVerifyCompany data={formData} onChange={setFormData} />}
            {step === 2 && <StepAssociatedEntities data={formData} onChange={setFormData} />}
            {step === 3 && <StepAutoProfile data={formData} onChange={setFormData} />}
            {step === 4 && <StepComplianceCheck data={formData} onChange={setFormData} />}
            {step === 5 && <StepDataProfile data={formData} onChange={setFormData} />}
            {step === 6 && <StepImportPlanning data={formData} onChange={setFormData} />}
            {step === 7 && <StepApproveGoLive data={formData} onBuild={build} building={building} buildResult={buildResult} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length - 1}</div>
            {step < STEPS.length - 2 && (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canContinue()} className="gap-1">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === STEPS.length - 2 && !buildResult && (
              <Button onClick={() => setStep(s => s + 1)} className="gap-1">
                Review & Create <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}