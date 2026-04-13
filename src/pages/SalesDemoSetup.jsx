import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Building2, Search, CheckCircle2, Loader2, ChevronRight,
  MapPin, Globe, Phone, Users, Home, FileText, Zap, ArrowLeft, Lightbulb
} from 'lucide-react';

const STEPS = ['choose', 'researching', 'preview', 'building', 'done'];

export default function SalesDemoSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState('choose');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);
  const [buildResult, setBuildResult] = useState(null);
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    const agent = {
      name: searchName.trim(),
      location: searchLocation.trim() || 'UK',
      searchQuery: `${searchName.trim()} ${searchLocation.trim()} letting agent estate agent property management services legal entity company number`,
    };
    setSelectedAgent(agent);
    setError(null);
    setStep('researching');

    try {
      const res = await base44.functions.invoke('buildAgentDemo', {
        action: 'research',
        agent_name: agent.name,
        agent_location: agent.location,
        search_query: agent.searchQuery,
      });

      if (res.data?.success) {
        setResearchData(res.data.research);
        setStep('preview');
      } else {
        setError(res.data?.error || 'Research failed. Please try again.');
        setStep('choose');
      }
    } catch (e) {
      setError(e.message);
      setStep('choose');
    }
  };

  const handleBuildDemo = async () => {
    setStep('building');
    setError(null);

    try {
      const res = await base44.functions.invoke('buildAgentDemo', {
        action: 'build',
        agent_name: selectedAgent.name,
        agent_location: selectedAgent.location,
        research: researchData,
      });

      if (res.data?.success) {
        setBuildResult(res.data);
        setStep('done');
        // Invalidate so DemoSwitcher and other pages pick up the new demo
        queryClient.invalidateQueries({ queryKey: ['demo-switcher-companies'] });
        queryClient.invalidateQueries({ queryKey: ['demo-switcher-properties'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      } else {
        setError(res.data?.error || 'Build failed. Please try again.');
        setStep('preview');
      }
    } catch (e) {
      setError(e.message);
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('choose');
    setSelectedAgent(null);
    setResearchData(null);
    setBuildResult(null);
    setError(null);
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
            Select a Horwich letting agent — Premiso will research their real-world background and build a tailored demo.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Choose Agent', 'Research', 'Preview', 'Build', 'Done'].map((label, idx) => {
            const stepIds = STEPS;
            const current = STEPS.indexOf(step);
            const isActive = idx === current;
            const isDone = idx < current;
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive ? 'bg-amber-500 text-white' :
                  isDone ? 'bg-green-600 text-white' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {isDone && <CheckCircle2 className="w-3 h-3" />}
                  {label}
                </div>
                {idx < 4 && <ChevronRight className="w-3 h-3 text-slate-600" />}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <Alert className="mb-6 bg-red-950 border-red-700">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* STEP: Choose */}
        {step === 'choose' && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  Search for Any Letting Agent or Property Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Company / Agent Name *</label>
                  <Input
                    placeholder="e.g. Redman Casey, Regency, Your Property Manager Ltd"
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Location (optional)</label>
                  <Input
                    placeholder="e.g. Horwich Bolton, Manchester, Leeds"
                    value={searchLocation}
                    onChange={e => setSearchLocation(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchName.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Research & Build Demo
                </Button>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-slate-500 text-xs mb-3">Quick examples</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Redman Casey, Horwich', 'Regency, Bolton', 'Lancasters, Horwich', 'Your Name, Any Town'].map(example => (
                  <button
                    key={example}
                    onClick={() => {
                      const [name, loc] = example.split(', ');
                      setSearchName(name);
                      setSearchLocation(loc || '');
                    }}
                    className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 pb-4">
                <p className="text-slate-400 text-xs leading-relaxed">
                  <span className="text-amber-400 font-semibold">How it works: </span>
                  Enter any letting agent, estate agent, block management firm or property company. Premiso will search public domain sources (Companies House, web listings, directories) to find their real trading name, legal entity, services, directors and background — then build a fully tailored demo environment using that data.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP: Researching */}
        {step === 'researching' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Researching {selectedAgent?.name}…</h2>
              <p className="text-slate-400 text-sm">
                Searching public domain sources for services, legal entity, trading history and background data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* STEP: Preview */}
        {step === 'preview' && researchData && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Research Preview — {selectedAgent?.name}</h2>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleReset}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Choose Different Agent
              </Button>
            </div>

            {/* Company Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" /> Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Trading Name" value={researchData.trading_name} />
                <InfoRow label="Legal Entity" value={researchData.legal_entity} />
                <InfoRow label="Company Number" value={researchData.company_number} />
                <InfoRow label="Registered Address" value={researchData.registered_address} />
                <InfoRow label="Founded / Est." value={researchData.founded} />
                <InfoRow label="Website" value={researchData.website} icon={Globe} />
                <InfoRow label="Phone" value={researchData.phone} icon={Phone} />
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-400" /> Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(researchData.services || []).map((svc, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-200">{svc}</Badge>
                  ))}
                </div>
                {researchData.services_description && (
                  <p className="text-slate-400 text-sm mt-3">{researchData.services_description}</p>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            {researchData.key_people?.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" /> Key People
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {researchData.key_people.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">{p.name}</span>
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">{p.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Demo Scope */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" /> Demo Data to be Created
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Company', value: '1 entity' },
                  { label: 'Properties', value: `${researchData.demo_properties || 3} properties` },
                  { label: 'Units', value: `${researchData.demo_units || 15} units` },
                  { label: 'Tenants', value: `${researchData.demo_tenants || 10} tenants` },
                  { label: 'Transactions', value: '24+' },
                  { label: 'Maintenance', value: '6 orders' },
                  { label: 'Contacts', value: `${researchData.key_people?.length || 2} contacts` },
                  { label: 'Compliance', value: 'Full set' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-700/50 rounded p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {researchData.background_notes && (
              <Card className="bg-amber-950/40 border-amber-800">
                <CardContent className="pt-4 pb-4 text-sm text-amber-200">
                  <span className="font-semibold text-amber-400">Background: </span>
                  {researchData.background_notes}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleBuildDemo}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 text-base"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Build {selectedAgent?.name} Demo
            </Button>
          </div>
        )}

        {/* STEP: Building */}
        {step === 'building' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Building Demo…</h2>
              <p className="text-slate-400 text-sm">
                Creating company, properties, units, tenants, financial records, compliance data
                <br />and running expansion opportunity research.
              </p>
            </CardContent>
          </Card>
        )}

        {/* STEP: Done */}
        {step === 'done' && buildResult && (
          <Card className="bg-green-950 border-green-700">
            <CardContent className="pt-10 pb-10 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">{selectedAgent?.name} Demo Ready</h2>
              <p className="text-green-300 text-sm mb-6">
                {buildResult.summary || 'All demo data has been successfully created.'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { label: 'Companies', value: buildResult.counts?.companies ?? '1' },
                  { label: 'Properties', value: buildResult.counts?.properties ?? '3' },
                  { label: 'Units', value: buildResult.counts?.units ?? '15' },
                  { label: 'Tenants', value: buildResult.counts?.tenants ?? '10' },
                ].map(item => (
                  <div key={item.label} className="bg-green-900/50 rounded p-3">
                    <p className="text-xs text-green-400 mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              {buildResult.expansion_included && (
                <Card className="bg-amber-950/40 border-amber-800 text-left mb-6 mx-auto max-w-md">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-amber-200">
                        <span className="font-semibold text-amber-400">Expansion report included — </span>
                        {buildResult.expansion_summary?.buildable_count || 0} buildable services,{' '}
                        {buildResult.expansion_summary?.software_detected || 0} software detected,{' '}
                        {buildResult.expansion_summary?.integrations_count || 0} integration opportunities.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/expansion-opportunities')}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  View Expansion Opportunities
                </Button>
                <Button variant="outline" onClick={handleReset} className="border-green-700 text-green-300 hover:bg-green-900">
                  Build Another Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-500 w-32 shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-slate-200 flex items-center gap-1.5 flex-1 text-xs">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
        {value}
      </span>
    </div>
  );
}