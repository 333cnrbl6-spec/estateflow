import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, Zap, Lightbulb, Building2, Database } from 'lucide-react';
import CompaniesHouseWizard from '@/components/onboarding/CompaniesHouseWizard';

const BUILD_STEPS = [
  'Setting up company profile',
  'Importing director information',
  'Generating property portfolio',
  'Creating tenant records',
  'Populating financial data',
  'Configuring compliance tracking',
  'Setting up maintenance workflows',
  'Running expansion opportunity research',
];

export default function SalesDemoSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // phase: 'ch' | 'building' | 'done'
  const [phase, setPhase] = useState('ch');
  const [chData, setChData] = useState(null);
  const [buildProgress, setBuildProgress] = useState([]);
  const [buildResult, setBuildResult] = useState(null);
  const [error, setError] = useState(null);

  // Floating gauge state
  const [gaugeStats, setGaugeStats] = useState({ profiles: 0, relationships: 0 });
  const gaugeInterval = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profiles, relationships] = await Promise.all([
          base44.entities.CompaniesHouseProfile.list('created_date', 1000),
          base44.entities.OwnershipRelationship.list('created_date', 1000),
        ]);
        setGaugeStats({ profiles: profiles.length, relationships: relationships.length });
      } catch (_) {}
    };
    fetchStats();
    gaugeInterval.current = setInterval(fetchStats, 4000);
    return () => clearInterval(gaugeInterval.current);
  }, []);

  const handleChComplete = async (data) => {
    setChData(data);
    setPhase('building');
    setError(null);

    // Animate build steps
    for (let i = 0; i < BUILD_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setBuildProgress(prev => [...prev, BUILD_STEPS[i]]);
    }

    try {
      const res = await base44.functions.invoke('buildAgentDemo', {
        action: 'build',
        agent_name: data.company?.company_name,
        agent_location: data.company?.registered_address || 'UK',
        research: {
          trading_name: data.company?.company_name,
          legal_entity: data.company?.company_name,
          company_number: data.company?.company_number,
          registered_address: data.company?.registered_address,
          founded: data.company?.date_of_creation,
          key_people: (data.officers || []).map(o => ({ name: o.name, role: o.role })),
          group_companies: (data.allCompanies || []).slice(1).map(c => ({ name: c.company_name, number: c.company_number })),
          associated_companies: data.selectedAssociated || [],
        },
      });

      if (res.data?.success) {
        setBuildResult(res.data);
        queryClient.invalidateQueries({ queryKey: ['demo-switcher-companies'] });
        queryClient.invalidateQueries({ queryKey: ['demo-switcher-properties'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        localStorage.setItem('premiso_brochure_data', JSON.stringify({
          agent_name: data.company?.company_name,
          research: res.data.research,
          expansion: null,
        }));
      } else {
        setError(res.data?.error || 'Build failed. Please try again.');
      }
    } catch (e) {
      setError(e.message);
    }

    setPhase('done');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-7 h-7 text-amber-400" />
            <h1 className="text-3xl font-serif font-bold text-white">Sales Demo Builder</h1>
          </div>
          <p className="text-slate-400">
            Search Companies House to find any UK letting agent or property management company — Premiso will build a tailored demo using their real data.
          </p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-950 border-red-700">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* CH Wizard Phase */}
        {phase === 'ch' && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <CompaniesHouseWizard mode="demo" onComplete={handleChComplete} />
          </div>
        )}

        {/* Building Phase */}
        {phase === 'building' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Building2 className="w-14 h-14 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-bold text-white mb-2">
                Building Demo for {chData?.company?.company_name}
                {chData?.allCompanies?.length > 1 && ` + ${chData.allCompanies.length - 1} more`}…
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Creating {chData?.allCompanies?.length > 1 ? `${chData.allCompanies.length} companies` : 'company'}, properties, tenants, financial records and compliance data.
              </p>
              <div className="max-w-xs mx-auto space-y-2 text-sm text-left">
                {buildProgress.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
                {buildProgress.length < BUILD_STEPS.length && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Working…</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Done Phase */}
        {phase === 'done' && (
          <Card className={error ? 'bg-red-950 border-red-700' : 'bg-green-950 border-green-700'}>
            <CardContent className="pt-10 pb-10 text-center">
              {error ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Build Encountered Issues</h2>
                  <p className="text-red-300 text-sm mb-6">{error}</p>
                  <Button onClick={() => { setPhase('ch'); setBuildProgress([]); setError(null); }}
                    className="bg-slate-700 hover:bg-slate-600 text-white">
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {chData?.company?.company_name} Demo Ready
                  </h2>
                  <p className="text-green-300 text-sm mb-6">
                    {buildResult?.summary || 'All demo data has been successfully created.'}
                  </p>
                  {buildResult?.expansion_included && (
                    <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800 rounded-lg p-3 text-xs text-amber-200 max-w-sm mx-auto mb-6 text-left">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-400">Expansion report included — </strong>
                        {buildResult.expansion_summary?.buildable_count || 0} buildable services,{' '}
                        {buildResult.expansion_summary?.software_detected || 0} software detected.
                      </span>
                    </div>
                  )}
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button onClick={() => navigate('/demo-station')}
                      className="bg-green-600 hover:bg-green-700 text-white">
                      Go to Demo Station
                    </Button>
                    <Button onClick={() => navigate('/expansion-opportunities')}
                      className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Lightbulb className="w-4 h-4 mr-1" /> Expansion Opportunities
                    </Button>
                    <Button variant="outline" onClick={() => { setPhase('ch'); setBuildProgress([]); setBuildResult(null); setChData(null); }}
                      className="border-green-700 text-green-300 hover:bg-green-900">
                      Build Another Demo
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Data Import Gauge */}
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-4 w-56 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-white">CH Data Import</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs text-green-400">live</span>
          </span>
        </div>

        {/* Profiles */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400">Companies</span>
            <span className="text-xs font-bold text-white">{gaugeStats.profiles.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (gaugeStats.profiles / 500) * 100)}%` }}
            />
          </div>
          <div className="text-right text-xs text-slate-600 mt-0.5">/ 500 target</div>
        </div>

        {/* Relationships */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400">Relationships</span>
            <span className="text-xs font-bold text-white">{gaugeStats.relationships.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (gaugeStats.relationships / 2000) * 100)}%` }}
            />
          </div>
          <div className="text-right text-xs text-slate-600 mt-0.5">/ 2k target</div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700 text-center">
          <span className="text-lg font-bold text-white">{(gaugeStats.profiles + gaugeStats.relationships).toLocaleString()}</span>
          <span className="text-xs text-slate-400 ml-1">total records</span>
        </div>
      </div>
    </div>
  );
}