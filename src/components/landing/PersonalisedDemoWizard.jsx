/**
 * PersonalisedDemoWizard — unified human-flow demo builder
 *
 * Steps:
 *   0  Who are you? (name + email + role) — collect ONCE, no duplication
 *   1  Find your company on Companies House — REAL data, grid with checkboxes
 *   2  Confirm directors (real from CH API — never fabricated)
 *   3  Portfolio details (size, type, pain points, current software)
 *   4  Building / Done
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import PersonalizedDemoSlideshow from './PersonalizedDemoSlideshow';
import {
  CheckCircle2, Building2, Loader2, ChevronRight, Search,
  Check, Circle, X, AlertCircle, Users, Star, Lock, ShieldCheck,
} from 'lucide-react';

// ── constants ────────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'letting_agent', label: 'Letting Agent' },
  { value: 'block_manager', label: 'Block / Leasehold Manager' },
  { value: 'landlord', label: 'Landlord / Investor' },
  { value: 'freeholder', label: 'Freeholder / RTM' },
  { value: 'sales_agent', label: 'Sales Agent' },
  { value: 'other', label: 'Other' },
];

const PORTFOLIO_SIZES = ['1–10 units', '11–50 units', '51–150 units', '151–500 units', '500+ units'];
const PROPERTY_TYPES = ['Residential Lettings', 'Block Management', 'HMO', 'Student', 'Commercial', 'Mixed Portfolio'];
const PAIN_POINTS = [
  'Compliance tracking', 'Rent collection & arrears', 'Maintenance management',
  'Financial reporting', 'Tenant communication', 'Block & service charge accounting',
];
const SOFTWARE_OPTIONS = ['Reapit', 'Jupix', 'Qube', 'Fixflo', 'Spreadsheets', 'Nothing yet', 'Other'];

const BUILD_STEPS = [
  'Setting up company profile',
  'Importing director information from Companies House',
  'Generating property portfolio',
  'Creating tenant records',
  'Populating financial data',
  'Configuring compliance tracking',
  'Setting up maintenance workflows',
];

// ── helpers ──────────────────────────────────────────────────────────────────

async function ch(action, params = {}) {
  const res = await base44.functions.invoke('companiesHouseSearch', { action, ...params });
  return res.data;
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const colour = s === 'active' ? 'bg-green-100 text-green-700'
    : s === 'dissolved' ? 'bg-red-100 text-red-600'
    : 'bg-slate-100 text-slate-500';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colour} capitalize`}>{status || 'Unknown'}</span>;
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['About you', 'Your company', 'Directors', 'Portfolio', 'Building demo'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto">
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`flex items-center gap-1.5 shrink-0 ${i <= current ? 'text-primary' : 'text-slate-300'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current ? 'bg-primary border-primary text-white'
                : i === current ? 'border-primary text-primary bg-white shadow-sm'
                : 'border-slate-200 text-slate-300 bg-white'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === current ? 'text-primary' : ''}`}>{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 min-w-[12px] ${i < current ? 'bg-primary' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Step 0: About you ─────────────────────────────────────────────────────────

function StepAboutYou({ data, onChange, onNext }) {
  const [error, setError] = useState('');
  const submit = () => {
    if (!data.name.trim() || !data.email.trim()) { setError('Name and email are required.'); return; }
    if (!data.role) { setError('Please select your role.'); return; }
    setError('');
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Let's get to know you</h3>
        <p className="text-sm text-slate-500 mt-1">We'll use this to personalise your demo — no duplicating later.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
          <input value={data.name} onChange={e => onChange({ name: e.target.value })}
            placeholder="James Harrison"
            className="w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email *</label>
          <input type="email" value={data.email} onChange={e => onChange({ email: e.target.value })}
            placeholder="james@company.co.uk"
            className="w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Phone (optional)</label>
        <input value={data.phone} onChange={e => onChange({ phone: e.target.value })}
          placeholder="07700 900000"
          className="w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:border-primary focus:outline-none" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-3">Your role *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ROLES.map(r => (
            <button key={r.value} onClick={() => onChange({ role: r.value })}
              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                data.role === r.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-primary/40 text-slate-700'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Consent — collected here, not repeated later */}
      <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={data.consent} onChange={e => onChange({ consent: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
          <span className="text-xs text-slate-600">
            <strong className="text-slate-800">I agree to the Terms of Use and Privacy Policy.</strong>{' '}
            I understand this demo is for evaluation purposes only. Premiso retains full ownership of all intellectual property. *
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={data.marketing} onChange={e => onChange({ marketing: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-primary shrink-0" />
          <span className="text-xs text-slate-600">
            Happy for Premiso to send relevant product updates and insights. (Optional)
          </span>
        </label>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> GDPR compliant</span>
        <span>·</span><span>48-hour demo access</span>
        <span>·</span><span>No card required</span>
      </div>

      <Button onClick={submit} disabled={!data.consent}
        className="w-full py-3 bg-primary text-white font-bold text-base">
        Continue — Find My Company →
      </Button>
    </div>
  );
}

// ── Step 1: Company search — REAL data, expanded grid ─────────────────────────

function StepCompany({ selectedCompanies, onToggle, onSetPrimary, onNext, onBack, userName }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(true);
    const data = await ch('search_companies', { query: query.trim() });
    if (data.error && data.source === 'unavailable') {
      setError('Companies House is temporarily unavailable. Please try again shortly.');
    } else if (!data.companies?.length) {
      setError('No companies found. Try a different name or company number.');
    } else {
      setResults(data.companies || []);
    }
    setLoading(false);
  };

  const primaryId = selectedCompanies[0]?.company_number;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Find your company</h3>
        <p className="text-sm text-slate-500 mt-1">
          We search <strong>live Companies House data</strong> — real company names, real directors, real structure. Select all companies in your group.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Company name or number e.g. Greystar, 01234567"
            className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-primary focus:outline-none text-sm" />
        </div>
        <Button onClick={search} disabled={loading || !query.trim()} className="shrink-0 px-5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Results — expanded grid with checkboxes */}
      {results.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            {results.length} results from Companies House — tick all that belong to your group
          </p>
          <div className="grid sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
            {results.map((co, i) => {
              const isSelected = !!selectedCompanies.find(s => s.company_number === co.company_number);
              const isPrimary = co.company_number === primaryId;
              return (
                <button key={i} onClick={() => onToggle(co)}
                  className={`text-left p-3 rounded-xl border-2 transition-all group ${
                    isSelected
                      ? isPrimary ? 'border-primary bg-primary/5' : 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-primary/30 bg-white'
                  }`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary border-primary' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{co.company_name}</p>
                        {isPrimary && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded font-semibold">Primary</span>}
                        <StatusBadge status={co.status} />
                      </div>
                      <p className="text-xs text-slate-500">{co.company_number}</p>
                      {co.registered_address && <p className="text-xs text-slate-400 truncate">{co.registered_address}</p>}
                      {co.date_of_creation && <p className="text-xs text-slate-400">Inc. {co.date_of_creation}</p>}
                    </div>
                  </div>
                  {isSelected && !isPrimary && (
                    <button onClick={e => { e.stopPropagation(); onSetPrimary(co); }}
                      className="mt-2 text-xs text-blue-600 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-50">
                      Set as primary
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="text-center py-6 border-2 border-dashed rounded-xl text-slate-400 text-sm">
          No results. Try searching by company number or a different name.
        </div>
      )}

      {/* Selected summary */}
      {selectedCompanies.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1.5">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            {selectedCompanies.length} compan{selectedCompanies.length !== 1 ? 'ies' : 'y'} selected
          </p>
          {selectedCompanies.map((co, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                {i === 0 ? <Star className="w-3 h-3 text-primary" /> : <Building2 className="w-3 h-3 text-blue-400" />}
                <span className="font-medium text-slate-800">{co.company_name}</span>
                {i === 0 && <span className="text-slate-400">primary</span>}
              </span>
              <button onClick={() => onToggle(co)} className="text-slate-300 hover:text-red-400 ml-2">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!selectedCompanies.length} className="flex-1">
          Confirm {selectedCompanies.length > 0 ? `${selectedCompanies.length} compan${selectedCompanies.length !== 1 ? 'ies' : 'y'}` : ''} →
        </Button>
      </div>
    </div>
  );
}

// ── Step 2: Directors — real CH data only ─────────────────────────────────────

function StepDirectors({ selectedCompanies, selected, onToggle, onNext, onBack }) {
  const [officersByCompany, setOfficersByCompany] = useState({});
  const [pscByCompany, setPscByCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!fetched && selectedCompanies.length > 0) {
      fetchAll();
    }
  }, [selectedCompanies]);

  const fetchAll = async () => {
    setLoading(true);
    setApiError('');
    const results = await Promise.allSettled(
      selectedCompanies.map(co =>
        Promise.all([
          ch('get_officers', { company_number: co.company_number }),
          ch('get_psc', { company_number: co.company_number }),
        ]).then(([o, p]) => ({ cn: co.company_number, officers: o.officers || [], psc: p.psc || [], source: o.source }))
      )
    );

    const newOfficers = {};
    const newPsc = {};
    let anyUnavailable = false;
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        newOfficers[r.value.cn] = r.value.officers;
        newPsc[r.value.cn] = r.value.psc;
        if (r.value.source === 'unavailable') anyUnavailable = true;
      }
    });
    setOfficersByCompany(newOfficers);
    setPscByCompany(newPsc);
    if (anyUnavailable) setApiError('Companies House API could not be reached for some companies. Director data shown is from successfully retrieved records only.');

    // Auto-select all active officers
    const autoSelected = [];
    const seen = new Set();
    Object.values(newOfficers).flat().forEach(o => {
      if (!o.resigned_on) {
        const key = o.name + o.role;
        if (!seen.has(key)) { seen.add(key); autoSelected.push(o); }
      }
    });
    // Only auto-select if nothing manually chosen yet
    if (autoSelected.length > 0 && selected.length === 0) {
      autoSelected.forEach(o => onToggle(o));
    }
    setFetched(true);
    setLoading(false);
  };

  // Merge officers across companies
  const allOfficers = [];
  const allPsc = [];
  const seen = new Set();
  selectedCompanies.forEach(co => {
    (officersByCompany[co.company_number] || []).forEach(o => {
      const key = o.name + o.role + co.company_number;
      if (!seen.has(key)) { seen.add(key); allOfficers.push({ ...o, _company: co.company_name }); }
    });
    (pscByCompany[co.company_number] || []).forEach(p => {
      const key = p.name + co.company_number;
      if (!seen.has(key)) { seen.add(key); allPsc.push({ ...p, _company: co.company_name }); }
    });
  });

  const active = allOfficers.filter(o => !o.resigned_on);
  const resigned = allOfficers.filter(o => !!o.resigned_on);
  const isSelected = (o) => !!selected.find(s => s.name === o.name && s.role === o.role);

  const PersonRow = ({ person }) => (
    <button onClick={() => onToggle(person)}
      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
        isSelected(person) ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40'
      }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isSelected(person) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {(person.name || '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800">{person.name}</p>
          <p className="text-xs text-slate-500">
            {person.role}
            {person.appointed_on ? ` · Appointed ${person.appointed_on}` : ''}
            {person.resigned_on ? ` · Resigned ${person.resigned_on}` : ''}
            {selectedCompanies.length > 1 && person._company ? ` · ${person._company}` : ''}
          </p>
        </div>
      </div>
      {isSelected(person) ? <Check className="w-4 h-4 text-primary shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Confirm directors & officers</h3>
        <p className="text-sm text-slate-500 mt-1">
          Pulled directly from <strong>Companies House</strong> — these are the real registered officers for your selected companies.
        </p>
      </div>

      {apiError && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-slate-500">Fetching live data from Companies House...</p>
        </div>
      )}

      {!loading && (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Officers ({active.length})</p>
              {active.map((o, i) => <PersonRow key={i} person={o} />)}
            </div>
          )}
          {allPsc.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Persons with Significant Control</p>
              {allPsc.map((p, i) => <PersonRow key={i} person={p} />)}
            </div>
          )}
          {resigned.length > 0 && (
            <details className="group">
              <summary className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 list-none flex items-center gap-1">
                <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                Resigned Officers ({resigned.length})
              </summary>
              <div className="space-y-2 mt-2 opacity-60">
                {resigned.map((o, i) => <PersonRow key={i} person={o} />)}
              </div>
            </details>
          )}
          {active.length === 0 && allPsc.length === 0 && !apiError && (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No officer data returned from Companies House.</p>
              <p className="text-xs mt-1">You can continue — director details can be added later.</p>
            </div>
          )}
          {selected.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary font-medium">
              {selected.length} person{selected.length !== 1 ? 's' : ''} selected for demo
            </div>
          )}
        </>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} className="flex-1" disabled={loading}>
          Continue →
        </Button>
      </div>
    </div>
  );
}

// ── Step 3: Portfolio details ─────────────────────────────────────────────────

function StepPortfolio({ data, onChange, onNext, onBack }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">About your portfolio</h3>
        <p className="text-sm text-slate-500 mt-1">This shapes the demo data we generate for you.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-3">Portfolio size *</label>
        <div className="flex flex-wrap gap-2">
          {PORTFOLIO_SIZES.map(s => (
            <button key={s} onClick={() => onChange({ portfolioSize: s })}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                data.portfolioSize === s ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-primary/40'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-3">Property types</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROPERTY_TYPES.map(t => (
            <button key={t}
              onClick={() => onChange({ propertyTypes: data.propertyTypes.includes(t) ? data.propertyTypes.filter(x => x !== t) : [...data.propertyTypes, t] })}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                data.propertyTypes.includes(t) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-primary/40'
              }`}>
              {data.propertyTypes.includes(t) && <Check className="w-3.5 h-3.5" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-3">Biggest pain points (optional)</label>
        <div className="grid grid-cols-2 gap-2">
          {PAIN_POINTS.map(p => (
            <button key={p}
              onClick={() => onChange({ painPoints: data.painPoints.includes(p) ? data.painPoints.filter(x => x !== p) : [...data.painPoints, p] })}
              className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                data.painPoints.includes(p) ? 'bg-amber-50 border-amber-400 text-amber-800' : 'border-slate-200 hover:border-slate-300'
              }`}>
              {data.painPoints.includes(p) ? '✓ ' : ''}{p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-3">Current software (optional)</label>
        <div className="flex flex-wrap gap-2">
          {SOFTWARE_OPTIONS.map(sw => (
            <button key={sw}
              onClick={() => onChange({ currentSoftware: data.currentSoftware === sw ? '' : sw })}
              className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                data.currentSoftware === sw ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-200 hover:border-slate-400'
              }`}>
              {sw}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!data.portfolioSize} className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold">
          Build My Demo →
        </Button>
      </div>
    </div>
  );
}

// ── Step 4: Building ──────────────────────────────────────────────────────────

function StepBuilding({ chData, contactData, portfolioData, onComplete }) {
  const [buildProgress, setBuildProgress] = useState([]);
  const [done, setDone] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    run();
  }, []);

  const run = async () => {
    // First capture the lead (name/email already collected in step 0)
    let leadId = null;
    try {
      const res = await base44.functions.invoke('captureMarketingLead', {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: chData?.company?.company_name || '',
        company_number: chData?.company?.company_number || '',
        portfolio_size: portfolioData.portfolioSize,
        property_types: portfolioData.propertyTypes.join(', '),
        pain_points: portfolioData.painPoints.join(', '),
        current_software: portfolioData.currentSoftware,
        demo_type: 'personalised',
        consent_given: true,
        marketing_consent: contactData.marketing,
        consent_timestamp: new Date().toISOString(),
        demo_intelligence: {
          primary_company: chData?.company || null,
          all_companies: chData?.allCompanies || [],
          officers: chData?.officers || [],
          portfolio_size: portfolioData.portfolioSize,
          property_types: portfolioData.propertyTypes,
          pain_points: portfolioData.painPoints,
        },
      });
      leadId = res.data?.leadId;
      if (leadId) {
        const token = { leadId, email: contactData.email, company: chData?.company?.company_name || '', expiresAt: Date.now() + 48 * 60 * 60 * 1000 };
        localStorage.setItem('premiso_demo_token', JSON.stringify(token));
        setSessionInfo({ ...token, name: contactData.name });
      }
    } catch {
      // proceed regardless
    }

    // Animate build steps
    for (let i = 0; i < BUILD_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 650));
      setBuildProgress(prev => [...prev, BUILD_STEPS[i]]);
    }

    // Kick off demo data generation
    try {
      await base44.functions.invoke('generateSalesDemoData', {
        companyName: chData?.company?.company_name,
        companyNumber: chData?.company?.company_number,
        directors: chData?.officers || [],
        groupCompanies: chData?.allCompanies || [],
        portfolioSize: portfolioData.portfolioSize,
        propertyTypes: portfolioData.propertyTypes,
        painPoints: portfolioData.painPoints,
      });
    } catch {
      // proceed regardless
    }

    setDone(true);
  };

  if (!done) {
    return (
      <div className="text-center py-4">
        <Building2 className="w-14 h-14 text-primary mx-auto mb-4 animate-pulse" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Building Your Demo...</h3>
        <p className="text-slate-500 mb-6">
          Creating a personalised Premiso environment for <strong>{chData?.company?.company_name || 'your company'}</strong>
        </p>
        <div className="max-w-xs mx-auto space-y-2 text-sm text-left">
          {buildProgress.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Generating demo data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Demo is Ready!</h3>
      <p className="text-slate-500 mb-1">
        A personalised Premiso environment has been built for <strong>{chData?.company?.company_name}</strong>.
      </p>
      <p className="text-xs text-slate-400 mb-6">
        Prepared for <strong>{contactData.email}</strong> · Access expires in 48 hours
      </p>
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <Button onClick={() => onComplete(sessionInfo)}
          className="w-full bg-primary text-white font-bold py-3 text-base">
          Explore Your Demo →
        </Button>
        <p className="text-xs text-slate-400">30-day free trial · No credit card required</p>
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export default function PersonalisedDemoWizard({ onComplete }) {
  const [step, setStep] = useState(0);

  // Step 0 — contact info (collected once)
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '', role: '', consent: false, marketing: false });

  // Step 1 — companies
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  // Step 2 — directors
  const [selectedOfficers, setSelectedOfficers] = useState([]);

  // Step 3 — portfolio
  const [portfolioData, setPortfolioData] = useState({ portfolioSize: '', propertyTypes: [], painPoints: [], currentSoftware: '' });

  const toggleCompany = (co) => setSelectedCompanies(prev => {
    const exists = prev.find(s => s.company_number === co.company_number);
    return exists ? prev.filter(s => s.company_number !== co.company_number) : [...prev, co];
  });

  const setPrimary = (co) => setSelectedCompanies(prev => [co, ...prev.filter(s => s.company_number !== co.company_number)]);

  const toggleOfficer = (person) => setSelectedOfficers(prev => {
    const key = person.name + person.role;
    return prev.find(p => p.name + p.role === key) ? prev.filter(p => p.name + p.role !== key) : [...prev, person];
  });

  const chData = {
    company: selectedCompanies[0] || null,
    allCompanies: selectedCompanies,
    officers: selectedOfficers,
    selectedAssociated: [],
  };

  const [showDemoSlideshow, setShowDemoSlideshow] = useState(false);
  const [demoSession, setDemoSession] = useState(null);

  const handleDemoComplete = (session) => {
    setDemoSession(session);
    setShowDemoSlideshow(true);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <StepIndicator current={step} />

        <div className="bg-white border-2 rounded-2xl p-6 md:p-8 shadow-sm min-h-[400px]">
          {step === 0 && (
            <StepAboutYou data={contactData} onChange={patch => setContactData(p => ({ ...p, ...patch }))} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <StepCompany
              selectedCompanies={selectedCompanies}
              onToggle={toggleCompany}
              onSetPrimary={setPrimary}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
              userName={contactData.name}
            />
          )}
          {step === 2 && (
            <StepDirectors
              selectedCompanies={selectedCompanies}
              selected={selectedOfficers}
              onToggle={toggleOfficer}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepPortfolio
              data={portfolioData}
              onChange={patch => setPortfolioData(p => ({ ...p, ...patch }))}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepBuilding
              chData={chData}
              contactData={contactData}
              portfolioData={portfolioData}
              onComplete={handleDemoComplete}
            />
          )}
        </div>
      </div>

      {/* Personalized demo slideshow gateway */}
      {showDemoSlideshow && demoSession && (
        <PersonalizedDemoSlideshow
          demoData={{
            company: selectedCompanies[0]?.company_name,
            directors: selectedOfficers,
            portfolioSize: portfolioData.portfolioSize,
            propertyTypes: portfolioData.propertyTypes,
            painPoints: portfolioData.painPoints,
            currentSoftware: portfolioData.currentSoftware,
          }}
          onDismiss={() => {
            setShowDemoSlideshow(false);
            onComplete?.(demoSession);
          }}
          onStartDemo={() => {
            setShowDemoSlideshow(false);
            onComplete?.(demoSession);
          }}
        />
      )}
    </>
  );
}