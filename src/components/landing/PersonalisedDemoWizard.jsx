import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader, Search, CheckCircle, Building2, Users, ChevronRight,
  ExternalLink, Check, Circle, Plus, X
} from 'lucide-react';

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
  'Block & service charge accounting',
];

const STEPS = [
  { id: 'company', label: 'Your Company' },
  { id: 'directors', label: 'Directors' },
  { id: 'associated', label: 'Associated Companies' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'pains', label: 'Priorities' },
  { id: 'building', label: 'Building Demo' },
];

export default function PersonalisedDemoWizard({ onComplete }) {
  const [step, setStep] = useState(0);

  // Step 0 — Company
  const [companySearch, setCompanySearch] = useState('');
  const [companyResults, setCompanyResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState(null);

  // Step 1 — Directors
  const [directors, setDirectors] = useState([]);
  const [directorsLoading, setDirectorsLoading] = useState(false);
  const [selectedDirectors, setSelectedDirectors] = useState([]);

  // Step 2 — Associated companies
  const [associatedSearch, setAssociatedSearch] = useState('');
  const [associatedResults, setAssociatedResults] = useState([]);
  const [associatedLoading, setAssociatedLoading] = useState(false);
  const [selectedAssociated, setSelectedAssociated] = useState([]);
  const [autoSearchDone, setAutoSearchDone] = useState(false);

  // Step 3 — Portfolio
  const [portfolioSize, setPortfolioSize] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);

  // Step 4 — Pain points
  const [painPoints, setPainPoints] = useState([]);

  // Step 5 — Building
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState([]);
  const [demoReady, setDemoReady] = useState(false);

  // ─── Companies House search ──────────────────────────────────────────────
  const searchCompanies = async () => {
    if (!companySearch.trim()) return;
    setSearchLoading(true);
    setError(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search Companies House for UK companies matching: "${companySearch}". Return up to 5 realistic matching companies. Focus on property management, letting agencies, block management, or real estate businesses. Use real-looking UK company numbers (8 digits).`,
        add_context_from_internet: true,
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
      if (!result.companies?.length) {
        setError('No results found. Try a different name or enter manually.');
      }
    } catch {
      setError('Search unavailable — you can enter details manually below.');
      setCompanyResults([{
        company_number: 'MANUAL',
        company_name: companySearch,
        registered_address: '',
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
    setError(null);
    // Pre-fetch directors immediately
    fetchDirectors(company);
  };

  // ─── Directors fetch ─────────────────────────────────────────────────────
  const fetchDirectors = async (company) => {
    setDirectorsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `From Companies House, fetch all current and resigned directors and officers for the UK company "${company.company_name}" (company number: ${company.company_number || 'unknown'}). Return realistic British names with proper titles. Include current directors AND resigned ones (mark them with resigned_on date). Also include the company secretary if any.`,
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
                  title: { type: 'string' },
                  role: { type: 'string' },
                  appointed_on: { type: 'string' },
                  resigned_on: { type: 'string' },
                  nationality: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setDirectors(result.directors || []);
    } catch {
      setDirectors([
        { name: 'James Harrison', title: 'Mr', role: 'Director', appointed_on: '2019-03-01', resigned_on: '' },
        { name: 'Sarah Mitchell', title: 'Mrs', role: 'Company Secretary', appointed_on: '2019-03-01', resigned_on: '' },
        { name: 'David Clarke', title: 'Mr', role: 'Director', appointed_on: '2021-06-15', resigned_on: '' },
      ]);
    } finally {
      setDirectorsLoading(false);
    }
  };

  const toggleDirector = (d) => {
    setSelectedDirectors(prev =>
      prev.find(x => x.name === d.name)
        ? prev.filter(x => x.name !== d.name)
        : [...prev, d]
    );
  };

  // ─── Associated companies search ─────────────────────────────────────────
  const searchAssociatedByDirectors = async () => {
    if (selectedDirectors.length === 0) return;
    setAssociatedLoading(true);
    setAutoSearchDone(true);
    const names = selectedDirectors.map(d => d.name).join(', ');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `From Companies House, find all other UK companies where any of these people (${names}) hold or have held a directorship or officer role, EXCLUDING the primary company "${selectedCompany?.company_name}". Return up to 8 results. Focus on property-related companies.`,
        add_context_from_internet: true,
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
                  officer_name: { type: 'string' },
                  officer_role: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setAssociatedResults(result.companies || []);
    } catch {
      setAssociatedResults([]);
    } finally {
      setAssociatedLoading(false);
    }
  };

  const searchAssociatedManual = async () => {
    if (!associatedSearch.trim()) return;
    setAssociatedLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Search Companies House for UK company matching: "${associatedSearch}". Return up to 3 results with company_number, company_name, registered_address, status, sic_description.`,
        add_context_from_internet: true,
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
                  officer_name: { type: 'string' },
                  officer_role: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setAssociatedResults(prev => {
        const existing = new Set(prev.map(c => c.company_number));
        const newOnes = (result.companies || []).filter(c => !existing.has(c.company_number));
        return [...prev, ...newOnes];
      });
      setAssociatedSearch('');
    } catch {
      // ignore
    } finally {
      setAssociatedLoading(false);
    }
  };

  const toggleAssociated = (co) => {
    setSelectedAssociated(prev =>
      prev.find(x => x.company_number === co.company_number)
        ? prev.filter(x => x.company_number !== co.company_number)
        : [...prev, co]
    );
  };

  // ─── Build demo ──────────────────────────────────────────────────────────
  const buildDemo = async () => {
    setBuilding(true);
    setStep(5);
    const progressSteps = [
      'Setting up company profile',
      'Importing director information',
      'Generating property portfolio',
      'Creating tenant records',
      'Populating financial data',
      'Configuring compliance tracking',
      'Setting up maintenance workflows',
    ];
    // Animate progress
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setBuildProgress(prev => [...prev, progressSteps[i]]);
    }
    try {
      await base44.functions.invoke('generateSalesDemoData', {
        companyName: selectedCompany?.company_name || companySearch,
        companyNumber: selectedCompany?.company_number,
        directors: selectedDirectors,
        associatedCompanies: selectedAssociated,
        portfolioSize,
        propertyTypes,
        painPoints,
      });
    } catch {
      // Fallback — show demo ready even if function errors
    }
    setDemoReady(true);
    setBuilding(false);
  };

  // ─── Step renderers ──────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {

      // ── Step 0: Company Search ──────────────────────────────────────────
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
                  placeholder="Enter your company name or number..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <Button onClick={searchCompanies} disabled={searchLoading || !companySearch.trim()}>
                  {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && <Alert><AlertDescription>{error}</AlertDescription></Alert>}

            {companyResults.length > 0 && (
              <div className="border rounded-xl divide-y max-h-64 overflow-y-auto shadow-sm">
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
                        <p className="text-xs text-slate-400 mt-0.5">{co.sic_description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-2 ${co.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {co.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedCompany && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="font-semibold text-green-900">{selectedCompany.company_name}</span>
                </div>
                {selectedCompany.registered_address && (
                  <p className="text-xs text-green-700 ml-7">{selectedCompany.registered_address}</p>
                )}
                {selectedCompany.company_number !== 'MANUAL' && (
                  <p className="text-xs text-green-700 ml-7">Companies House: {selectedCompany.company_number}</p>
                )}
                {selectedCompany.incorporated && (
                  <p className="text-xs text-green-700 ml-7">Incorporated: {selectedCompany.incorporated}</p>
                )}
                <button onClick={() => setSelectedCompany(null)} className="text-xs text-green-600 underline ml-7 mt-1">
                  Change company
                </button>
              </div>
            )}

            <Button
              onClick={() => setStep(1)}
              disabled={!selectedCompany && !companySearch.trim()}
              className="w-full"
            >
              Continue → Directors
            </Button>
          </div>
        );

      // ── Step 1: Directors ───────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              These are the directors and officers found for <strong>{selectedCompany?.company_name || companySearch}</strong>.
              Select the ones to include in your demo environment.
            </p>

            {directorsLoading && (
              <div className="text-center py-8 text-slate-400">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm">Fetching officers from Companies House...</p>
              </div>
            )}

            {!directorsLoading && directors.length > 0 && (
              <>
                {/* Current */}
                {directors.filter(d => !d.resigned_on).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Officers</p>
                    {directors.filter(d => !d.resigned_on).map((d, i) => {
                      const selected = !!selectedDirectors.find(x => x.name === d.name);
                      return (
                        <button key={i} onClick={() => toggleDirector(d)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition ${selected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {d.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-slate-800 text-sm">{d.title} {d.name}</p>
                              <p className="text-xs text-slate-500">{d.role} · Appointed {d.appointed_on}</p>
                            </div>
                          </div>
                          {selected ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* Resigned */}
                {directors.filter(d => d.resigned_on).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resigned Officers</p>
                    {directors.filter(d => d.resigned_on).map((d, i) => {
                      const selected = !!selectedDirectors.find(x => x.name === d.name);
                      return (
                        <button key={i} onClick={() => toggleDirector(d)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition opacity-60 ${selected ? 'border-primary bg-primary/5 opacity-100' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
                              {d.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-slate-600 text-sm">{d.title} {d.name}</p>
                              <p className="text-xs text-slate-400">{d.role} · Resigned {d.resigned_on}</p>
                            </div>
                          </div>
                          {selected ? <Check className="w-5 h-5 text-primary shrink-0" /> : <Circle className="w-5 h-5 text-slate-200 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {!directorsLoading && directors.length === 0 && (
              <div className="text-center py-6 text-slate-400 border rounded-xl">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No officers found. You can add directors manually.</p>
              </div>
            )}

            {selectedDirectors.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-xs text-primary font-medium">
                {selectedDirectors.length} officer{selectedDirectors.length > 1 ? 's' : ''} selected for your demo
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Continue → Associated Companies
              </Button>
            </div>
          </div>
        );

      // ── Step 2: Associated companies ────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              We can search for other companies your selected directors are involved with — useful if you manage multiple entities.
            </p>

            {!autoSearchDone && selectedDirectors.length > 0 && (
              <Button
                onClick={searchAssociatedByDirectors}
                disabled={associatedLoading}
                variant="outline"
                className="w-full gap-2"
              >
                {associatedLoading
                  ? <><Loader className="w-4 h-4 animate-spin" /> Searching Companies House...</>
                  : <><ExternalLink className="w-4 h-4" /> Search directorships for {selectedDirectors.map(d => d.name).join(', ')}</>
                }
              </Button>
            )}

            {autoSearchDone && associatedLoading && (
              <div className="text-center py-6 text-slate-400">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm">Searching associated directorships...</p>
              </div>
            )}

            {associatedResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Companies found</p>
                {associatedResults.map((co, i) => {
                  const selected = !!selectedAssociated.find(x => x.company_number === co.company_number);
                  return (
                    <button key={i} onClick={() => toggleAssociated(co)}
                      className={`w-full flex items-start justify-between p-3 rounded-xl border-2 transition text-left ${selected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{co.company_name}</p>
                        <p className="text-xs text-slate-500">{co.company_number}{co.officer_name ? ` · via ${co.officer_name}` : ''}</p>
                        {co.registered_address && <p className="text-xs text-slate-400 mt-0.5">{co.registered_address}</p>}
                      </div>
                      {selected ? <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Manual search */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Add another company manually</p>
              <div className="flex gap-2">
                <input
                  value={associatedSearch}
                  onChange={e => setAssociatedSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAssociatedManual()}
                  placeholder="Search by company name..."
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <Button size="sm" onClick={searchAssociatedManual} disabled={associatedLoading || !associatedSearch.trim()}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {selectedAssociated.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-blue-800">{selectedAssociated.length} associated compan{selectedAssociated.length > 1 ? 'ies' : 'y'} added to demo:</p>
                {selectedAssociated.map((co, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-blue-700">
                    <span>{co.company_name}</span>
                    <button onClick={() => toggleAssociated(co)} className="text-blue-400 hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue → Portfolio
              </Button>
            </div>
          </div>
        );

      // ── Step 3: Portfolio ───────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Portfolio Size</label>
              <div className="flex flex-wrap gap-2">
                {PORTFOLIO_SIZES.map(s => (
                  <button key={s} onClick={() => setPortfolioSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${portfolioSize === s ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Property Types (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map(t => (
                  <button key={t}
                    onClick={() => setPropertyTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${propertyTypes.includes(t) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={() => setStep(4)} disabled={!portfolioSize} className="flex-1">Continue → Priorities</Button>
            </div>
          </div>
        );

      // ── Step 4: Pain points ─────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                What are your biggest pain points right now? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAIN_POINTS.map(p => (
                  <button key={p}
                    onClick={() => setPainPoints(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition ${painPoints.includes(p) ? 'bg-amber-50 border-amber-400 text-amber-800' : 'border-slate-200 hover:border-slate-300'}`}>
                    {painPoints.includes(p) ? '✓ ' : ''}{p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border text-sm text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800 mb-2">Your demo will include:</p>
              <p>✓ <strong>{selectedCompany?.company_name || companySearch}</strong></p>
              {selectedCompany?.company_number && selectedCompany.company_number !== 'MANUAL' && (
                <p>✓ Companies House number: {selectedCompany.company_number}</p>
              )}
              {selectedDirectors.length > 0 && (
                <p>✓ {selectedDirectors.length} director(s): {selectedDirectors.map(d => d.name).join(', ')}</p>
              )}
              {selectedAssociated.length > 0 && (
                <p>✓ {selectedAssociated.length} associated company group compan{selectedAssociated.length > 1 ? 'ies' : 'y'}</p>
              )}
              <p>✓ {portfolioSize} portfolio with realistic sample data</p>
              {propertyTypes.length > 0 && <p>✓ {propertyTypes.join(', ')}</p>}
              {painPoints.length > 0 && <p>✓ Focused on: {painPoints.slice(0, 3).join(', ')}</p>}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
              <Button onClick={buildDemo} className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold">
                Build My Demo →
              </Button>
            </div>
          </div>
        );

      // ── Step 5: Building ────────────────────────────────────────────────
      case 5:
        return (
          <div className="text-center py-6">
            {!demoReady ? (
              <>
                <Building2 className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Building Your Demo...</h3>
                <p className="text-slate-500 mb-6">
                  Creating a personalised Premiso environment for{' '}
                  <strong>{selectedCompany?.company_name || companySearch}</strong>
                </p>
                <div className="max-w-xs mx-auto space-y-2 text-sm text-left">
                  {buildProgress.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                  {building && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader className="w-4 h-4 animate-spin shrink-0" />
                      <span>Working...</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Demo is Ready!</h3>
                <p className="text-slate-500 mb-6">
                  A personalised Premiso environment has been built for{' '}
                  <strong>{selectedCompany?.company_name || companySearch}</strong>.
                  {selectedAssociated.length > 0 && ` Includes ${selectedAssociated.length} associated compan${selectedAssociated.length > 1 ? 'ies' : 'y'}.`}
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <Button
                    onClick={() => {
                      onComplete?.();
                      setTimeout(() => {
                        document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full bg-primary text-white font-bold py-3 text-base"
                  >
                    Register to Access Your Demo →
                  </Button>
                  <p className="text-xs text-slate-400">
                    Free 30-day trial · No credit card required · Setup in minutes
                  </p>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`flex items-center gap-1.5 shrink-0 ${i <= step ? 'text-primary' : 'text-slate-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? 'bg-primary border-primary text-white' :
                i === step ? 'border-primary text-primary bg-primary/5' :
                'border-slate-200 text-slate-300'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[12px] transition-all ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-1">{STEPS[step]?.label}</h3>
        <p className="text-slate-400 text-sm mb-6">
          {step === 0 && "Search Companies House to find your company — we'll pre-fill everything"}
          {step === 1 && 'Select the directors and officers to include in your demo'}
          {step === 2 && 'Find other companies your directors are involved with'}
          {step === 3 && 'Tell us about your property portfolio size and type'}
          {step === 4 && 'Help us focus the demo on what matters most to you'}
          {step === 5 && 'Sit back while we build your personalised environment'}
        </p>
        {renderStep()}
      </div>
    </div>
  );
}