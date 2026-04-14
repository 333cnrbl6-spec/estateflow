/**
 * PersonalisedDemoWizard
 * Landing page demo builder — wraps CompaniesHouseWizard then collects
 * portfolio details and builds the demo.
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Building2, Loader2, ChevronRight } from 'lucide-react';
import CompaniesHouseWizard from '@/components/onboarding/CompaniesHouseWizard';

const PROPERTY_TYPES = ['Residential Lettings', 'Block Management', 'Commercial', 'Student', 'HMO', 'Mixed Portfolio'];
const PORTFOLIO_SIZES = ['1–10 units', '11–50 units', '51–150 units', '151–500 units', '500+ units'];
const PAIN_POINTS = [
  'Compliance tracking', 'Rent collection & arrears', 'Maintenance management',
  'Financial reporting', 'Tenant communication', 'Contractor management',
  'Document management', 'Block & service charge accounting',
];

const BUILD_STEPS = [
  'Setting up company profile',
  'Importing director information',
  'Generating property portfolio',
  'Creating tenant records',
  'Populating financial data',
  'Configuring compliance tracking',
  'Setting up maintenance workflows',
];

export default function PersonalisedDemoWizard({ onComplete }) {
  // phase: 'ch' → Companies House 4-step wizard
  //         'portfolio' → portfolio / pain point questions
  //         'building' → animated build
  const [phase, setPhase] = useState('ch');
  const [chData, setChData] = useState(null);

  // Portfolio phase
  const [portfolioSize, setPortfolioSize] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [painPoints, setPainPoints] = useState([]);

  // Build phase
  const [buildProgress, setBuildProgress] = useState([]);
  const [demoReady, setDemoReady] = useState(false);

  const handleChComplete = (data) => {
    // data now includes allCompanies (multi-select from step 0)
    setChData(data);
    setPhase('portfolio');
  };

  const buildDemo = async () => {
    setPhase('building');
    for (let i = 0; i < BUILD_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 650));
      setBuildProgress(prev => [...prev, BUILD_STEPS[i]]);
    }
    try {
      await base44.functions.invoke('generateSalesDemoData', {
        companyName: chData?.company?.company_name,
        companyNumber: chData?.company?.company_number,
        directors: chData?.officers || [],
        groupCompanies: chData?.allCompanies || [],
        associatedCompanies: chData?.selectedAssociated || [],
        portfolioSize,
        propertyTypes,
        painPoints,
      });
    } catch {
      // show ready regardless
    }
    setDemoReady(true);
  };

  // ── Portfolio step ──────────────────────────────────────────────────────
  if (phase === 'portfolio') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Mini progress */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
          <span className="text-primary font-semibold">✓ Company confirmed</span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-slate-700">Portfolio details</span>
        </div>

        <div className="bg-white border-2 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {/* Company recap */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary shrink-0" />
            <div>
              <p className="font-bold text-slate-900">{chData?.company?.company_name}</p>
              <p className="text-xs text-slate-500">
                {chData?.company?.company_number}
                {chData?.allCompanies?.length > 1 && ` · ${chData.allCompanies.length} group companies`}
                {chData?.officers?.length > 0 && ` · ${chData.officers.length} officer${chData.officers.length !== 1 ? 's' : ''}`}
                {chData?.selectedAssociated?.length > 0 && ` · ${chData.selectedAssociated.length} additional compan${chData.selectedAssociated.length !== 1 ? 'ies' : 'y'}`}
              </p>
            </div>
          </div>

          {/* Portfolio size */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Portfolio size</label>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_SIZES.map(s => (
                <button key={s} onClick={() => setPortfolioSize(s)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    portfolioSize === s ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-primary/40'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Property types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Property types (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(t => (
                <button key={t}
                  onClick={() => setPropertyTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    propertyTypes.includes(t) ? 'bg-primary text-white border-primary' : 'border-slate-200 hover:border-primary/40'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pain points */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Biggest pain points right now (optional)</label>
            <div className="grid grid-cols-2 gap-2">
              {PAIN_POINTS.map(p => (
                <button key={p}
                  onClick={() => setPainPoints(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                    painPoints.includes(p) ? 'bg-amber-50 border-amber-400 text-amber-800' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  {painPoints.includes(p) ? '✓ ' : ''}{p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setPhase('ch')}>← Back</Button>
            <Button onClick={buildDemo} disabled={!portfolioSize}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold text-base py-3">
              Build My Demo →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Building / Done ─────────────────────────────────────────────────────
  if (phase === 'building') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white border-2 rounded-2xl p-8 shadow-sm text-center">
          {!demoReady ? (
            <>
              <Building2 className="w-14 h-14 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Building Your Demo...</h3>
              <p className="text-slate-500 mb-6">
                Creating a personalised Premiso environment for{' '}
                <strong>{chData?.company?.company_name}</strong>
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
                  <span>Working...</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Demo is Ready!</h3>
              <p className="text-slate-500 mb-6">
                A personalised Premiso environment has been built for{' '}
                <strong>{chData?.company?.company_name}</strong>.
                {(chData?.allCompanies?.length > 1 || chData?.selectedAssociated?.length > 0) && (
                  ` Includes ${(chData?.allCompanies?.length || 1) + (chData?.selectedAssociated?.length || 0)} companies total.`
                )}
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
                <p className="text-xs text-slate-400">Free 30-day trial · No credit card required</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Companies House wizard (default phase) ─────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <CompaniesHouseWizard mode="demo" onComplete={handleChComplete} />
    </div>
  );
}