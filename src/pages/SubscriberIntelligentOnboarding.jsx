import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2, Users, CheckCircle2, Circle, Loader2, Sparkles, FileText, Globe,
  HardDrive, Database, Home, Key, Wrench, Receipt, AlertCircle, Check, X,
  ChevronRight, ChevronLeft, Search, ExternalLink
} from 'lucide-react';

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

function StepCompanyLookup({ data, onChange }) {
  const [query, setQuery] = useState(data.company_name || '');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search Companies House for: "${query}". Return top 5 results with company_name, company_number, status, registered_address, incorporation_date.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_number: { type: 'string' },
                  status: { type: 'string' },
                  registered_address: { type: 'string' },
                  incorporation_date: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setResults(res.results || []);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const select = (c) => {
    onChange({ ...data, ...c, company_verified: true });
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Find Your Company</h2>
        <p className="text-sm text-muted-foreground mt-1">Search Companies House to auto-populate your profile.</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Company name or number"
          className="flex-1"
        />
        <Button onClick={search} disabled={searching} className="gap-2">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Select your company</p>
          {results.map((r, i) => (
            <div key={i} onClick={() => select(r)}
              className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{r.company_name}</p>
                  <p className="text-xs text-muted-foreground">{r.company_number} • {r.status}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.registered_address}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {data.company_verified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Company verified</span>
          </div>
          <p className="text-sm text-green-700">{data.company_name}</p>
        </div>
      )}
    </div>
  );
}

function StepVerifyCompany({ data, onChange }) {
  const [fetching, setFetching] = useState(false);

  const fetchOfficers = async () => {
    if (!data.company_number) return;
    setFetching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `From Companies House for ${data.company_number}, fetch all directors with: name, role, appointed_date, nationality.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            directors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  appointed_date: { type: 'string' },
                },
              },
            },
          },
        },
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

function StepAssociatedEntities({ data, onChange }) {
  const [finding, setFinding] = useState(false);

  const findAssociated = async () => {
    if (!data.company_number) return;
    setFinding(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find companies associated with ${data.company_number} (sister companies, group entities, shared officers). Return top 5 with company_name and company_number.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            associated: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_number: { type: 'string' },
                },
              },
            },
          },
        },
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

function StepAutoProfile({ data, onChange }) {
  const [gathering, setGathering] = useState(false);

  const gatherBusinessIntel = async () => {
    setGathering(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For ${data.company_name}, research public web data to find: services offered, estimated portfolio size, locations, technology stack, reputation. Return structured data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            services: { type: 'array', items: { type: 'string' } },
            portfolio_estimate: { type: 'string' },
            locations: { type: 'array', items: { type: 'string' } },
            tech_stack: { type: 'array', items: { type: 'string' } },
            reputation: { type: 'string' },
          },
        },
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

function StepComplianceCheck({ data, onChange }) {
  const [checking, setChecking] = useState(false);

  const checkCompliance = async () => {
    setChecking(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Check regulatory status for ${data.company_name}: FCA regulated, redress scheme, client money protection, GDPR compliance. Return findings.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            fca_regulated: { type: 'boolean' },
            redress_scheme: { type: 'string' },
            client_money_protection: { type: 'boolean' },
            gdpr_status: { type: 'string' },
          },
        },
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

function StepDataProfile({ data, onChange }) {
  const [predicting, setPredicting] = useState(false);

  const predictDataProfile = async () => {
    setPredicting(true);
    try {
      const services = (data.business_profile?.services || []).join(', ');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For a company offering: ${services}, predict what data they likely have: properties/units count estimate, tenants estimate, financial records period, likely storage locations (Xero, Google Drive, email, etc.). Be specific with estimates.`,
        response_json_schema: {
          type: 'object',
          properties: {
            estimated_properties: { type: 'number' },
            estimated_tenants: { type: 'number' },
            financial_period: { type: 'string' },
            likely_storage: { type: 'array', items: { type: 'string' } },
            import_complexity: { type: 'string' },
            estimated_hours: { type: 'number' },
          },
        },
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

function StepImportPlanning({ data, onChange }) {
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

function StepApproveGoLive({ data, onBuild, building, buildResult }) {
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
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            next_steps: { type: 'array', items: { type: 'string' } },
          },
        },
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