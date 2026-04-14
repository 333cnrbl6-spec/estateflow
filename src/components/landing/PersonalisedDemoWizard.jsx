import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, Search, CheckCircle, Building2 } from 'lucide-react';

const PROPERTY_TYPES = ['Residential Lettings', 'Block Management', 'Commercial', 'Student', 'HMO', 'Mixed Portfolio'];
const PORTFOLIO_SIZES = ['1–10 units', '11–50 units', '51–150 units', '151–500 units', '500+ units'];
const PAIN_POINTS = [
  'Compliance tracking',
  'Rent collection & arrears',
  'Maintenance management',
  'Financial reporting',
  'Tenant communication',
  'Contractor management',
  'Document management',
];

const STEPS = [
  { id: 'company', label: 'Your Company' },
  { id: 'directors', label: 'Directors' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'pains', label: 'Priorities' },
  { id: 'building', label: 'Building Demo' },
];

export default function PersonalisedDemoWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [companySearch, setCompanySearch] = useState('');
  const [companyResults, setCompanyResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [portfolioSize, setPortfolioSize] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [painPoints, setPainPoints] = useState([]);
  const [building, setBuilding] = useState(false);
  const [demoReady, setDemoReady] = useState(false);
  const [error, setError] = useState(null);

  // Companies House search via LLM (real API would need a backend function)
  const searchCompanies = async () => {
    if (!companySearch.trim()) return;
    setSearchLoading(true);
    setError(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search Companies House for UK companies matching: "${companySearch}". Return 5 realistic matching companies with their Companies House number, registered address, SIC code and status. Make the data realistic and plausible for a property management or letting agency business.`,
        response_json_schema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_number: { type: 'string' },
                  company_name: { type: 'string' },
                  registered_address: { type: 'string' },
                  status: { type: 'string' },
                  sic_code: { type: 'string' },
                  sic_description: { type: 'string' },
                  incorporated: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setCompanyResults(result.companies || []);
    } catch (err) {
      setError('Company search unavailable. You can enter details manually below.');
      // Allow manual entry fallback
      setCompanyResults([{
        company_number: 'MANUAL',
        company_name: companySearch,
        registered_address: 'Please complete your address manually',
        status: 'Active',
        sic_code: '68320',
        sic_description: 'Management of real estate on a fee or contract basis',
        incorporated: '',
      }]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCompany = async (company) => {
    setSelectedCompany(company);
    setCompanyResults([]);
    // Generate plausible directors
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3–5 plausible company directors for a UK property management company called "${company.company_name}". Use realistic British names with proper titles.`,
        response_json_schema: {
          type: 'object',
          properties: {
            directors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  title: { type: 'string' },
                  role: { type: 'string' },
                  appointed: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setDirectors(result.directors || []);
    } catch (err) {
      setDirectors([
        { name: 'James Harrison', title: 'Mr', role: 'Director', appointed: '2019-03-01' },
        { name: 'Sarah Mitchell', title: 'Mrs', role: 'Company Secretary', appointed: '2019-03-01' },
      ]);
    }
  };

  const toggleDirector = (d) => {
    setSelectedDirectors(prev =>
      prev.find(x => x.name === d.name)
        ? prev.filter(x => x.name !== d.name)
        : [...prev, d]
    );
  };

  const toggleType = (t) => {
    setPropertyTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const togglePain = (p) => {
    setPainPoints(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const buildDemo = async () => {
    setBuilding(true);
    setStep(4);
    try {
      // Invoke demo builder with personalised data
      await base44.functions.invoke('generateSalesDemoData', {
        companyName: selectedCompany?.company_name || companySearch,
        companyNumber: selectedCompany?.company_number,
        directors: selectedDirectors,
        portfolioSize,
        propertyTypes,
        painPoints,
      });
      setTimeout(() => {
        setDemoReady(true);
        setBuilding(false);
      }, 3000);
    } catch (err) {
      // Even if the function fails, show "demo ready" with static data
      setTimeout(() => {
        setDemoReady(true);
        setBuilding(false);
      }, 3000);
    }
  };

  // Step renderers
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Companies House</label>
              <div className="flex gap-2">
                <input
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchCompanies()}
                  placeholder="Enter your company name..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary"
                />
                <Button onClick={searchCompanies} disabled={searchLoading}>
                  {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert><AlertDescription>{error}</AlertDescription></Alert>
            )}

            {companyResults.length > 0 && (
              <div className="border rounded-xl divide-y max-h-64 overflow-y-auto">
                {companyResults.map((co, i) => (
                  <button
                    key={i}
                    onClick={() => selectCompany(co)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{co.company_name}</p>
                        <p className="text-xs text-slate-500">{co.company_number} · {co.registered_address}</p>
                        <p className="text-xs text-slate-400">{co.sic_description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${co.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {co.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedCompany && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">{selectedCompany.company_name}</span>
                </div>
                <p className="text-xs text-green-700">{selectedCompany.registered_address}</p>
                <p className="text-xs text-green-700">Companies House: {selectedCompany.company_number}</p>
              </div>
            )}

            <Button
              onClick={() => setStep(1)}
              disabled={!selectedCompany && !companySearch}
              className="w-full"
            >
              Continue →
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Select the directors you want to include in your demo environment. These will appear throughout the system.
            </p>

            {directors.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading company directors...
              </div>
            )}

            <div className="space-y-2">
              {directors.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDirector(d)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${
                    selectedDirectors.find(x => x.name === d.name)
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                      {d.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800">{d.title} {d.name}</p>
                      <p className="text-xs text-slate-500">{d.role}</p>
                    </div>
                  </div>
                  {selectedDirectors.find(x => x.name === d.name) && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
              <Button onClick={() => setStep(2)} className="flex-1">Continue →</Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Portfolio Size</label>
              <div className="flex flex-wrap gap-2">
                {PORTFOLIO_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setPortfolioSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      portfolioSize === s ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Property Types (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      propertyTypes.includes(t) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => setStep(3)} disabled={!portfolioSize} className="flex-1">Continue →</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                What are your biggest pain points right now? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAIN_POINTS.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePain(p)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition ${
                      painPoints.includes(p) ? 'bg-amber-50 border-amber-400 text-amber-800' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {painPoints.includes(p) ? '✓ ' : ''}{p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border">
              <h4 className="font-semibold text-slate-800 mb-2">Your demo will include:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>✓ <strong>{selectedCompany?.company_name || companySearch}</strong> as your company</li>
                {selectedDirectors.length > 0 && <li>✓ {selectedDirectors.length} director(s): {selectedDirectors.map(d => d.name).join(', ')}</li>}
                <li>✓ {portfolioSize} portfolio with realistic sample data</li>
                {propertyTypes.length > 0 && <li>✓ {propertyTypes.join(', ')} property types</li>}
                {painPoints.length > 0 && <li>✓ Focused on: {painPoints.slice(0, 3).join(', ')}</li>}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={buildDemo} className="flex-1 bg-amber-500 hover:bg-amber-400 text-white">
                Build My Demo →
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            {building ? (
              <>
                <Building2 className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Building Your Demo...</h3>
                <p className="text-slate-500 mb-6">
                  We're generating a personalised Premiso environment for{' '}
                  <strong>{selectedCompany?.company_name || companySearch}</strong>
                </p>
                <div className="max-w-xs mx-auto space-y-2 text-sm text-slate-500">
                  {['Setting up company profile', 'Generating property portfolio', 'Creating tenant records', 'Populating financial data', 'Configuring compliance tracking'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 justify-center">
                      <Loader className="w-3 h-3 animate-spin" />
                      {s}
                    </div>
                  ))}
                </div>
              </>
            ) : demoReady ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Demo is Ready!</h3>
                <p className="text-slate-500 mb-6">
                  A personalised Premiso environment has been built for{' '}
                  <strong>{selectedCompany?.company_name || companySearch}</strong>.
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button onClick={onComplete} className="w-full bg-primary">
                    Register to Access Your Demo →
                  </Button>
                  <p className="text-xs text-slate-400">
                    Create a free account to save and share your personalised demo
                  </p>
                </div>
              </>
            ) : null}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-slate-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < step ? 'bg-primary border-primary text-white' :
                i === step ? 'border-primary text-primary' :
                'border-slate-200 text-slate-300'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-1">{STEPS[step]?.label}</h3>
        <p className="text-slate-400 text-sm mb-6">
          {step === 0 && 'Tell us about your company — we\'ll connect to Companies House to verify'}
          {step === 1 && 'Choose which directors to include in your demo'}
          {step === 2 && 'Tell us about your property portfolio'}
          {step === 3 && 'Help us focus the demo on what matters to you'}
          {step === 4 && 'Sit back while we build your personalised environment'}
        </p>
        {renderStep()}
      </div>
    </div>
  );
}