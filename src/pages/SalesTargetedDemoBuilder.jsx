import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search, Loader2, Sparkles, Building2, Users, Globe, FileText, Download,
  CheckCircle2, ChevronRight, AlertCircle, Copy, Share2, ExternalLink, TrendingUp
} from 'lucide-react';

const DEMO_PHASES = [
  { id: 'research', label: 'Research Company', icon: Search },
  { id: 'analyze', label: 'Analyze & Match', icon: TrendingUp },
  { id: 'generate', label: 'Generate Demo', icon: Sparkles },
  { id: 'materials', label: 'Create Materials', icon: FileText },
  { id: 'share', label: 'Share & Track', icon: Share2 },
];

export default function SalesTargetedDemoBuilder() {
  const [phase, setPhase] = useState('research');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [demoResult, setDemoResult] = useState(null);
  const [generatingMaterials, setGeneratingMaterials] = useState(false);
  const [materials, setMaterials] = useState(null);
  const [shareLink, setShareLink] = useState(null);

  const searchCompany = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Research ${query} as a property management company. Find: company name, registered address, estimated portfolio size, services (residential, block management, etc.), number of locations/branches, technology stack, competitors, year founded, team size estimate, and any public reputation data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            company_name: { type: 'string' },
            registered_address: { type: 'string' },
            portfolio_estimate: { type: 'string' },
            property_count: { type: 'number' },
            services: { type: 'array', items: { type: 'string' } },
            locations: { type: 'array', items: { type: 'string' } },
            technology: { type: 'array', items: { type: 'string' } },
            competitors: { type: 'array', items: { type: 'string' } },
            team_size: { type: 'string' },
            founded_year: { type: 'string' },
            reputation: { type: 'string' },
          },
        },
      });
      setCompanyData(res);
      setPhase('analyze');
    } finally {
      setSearching(false);
    }
  };

  const analyzeAndMatch = async () => {
    if (!companyData) return;
    setMatching(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `For a prospect company with portfolio of ${companyData.property_count} properties in ${companyData.locations?.join(', ')}, offering ${companyData.services?.join(', ')}, create a matching demo dataset specification:
- Exact property count to match their portfolio
- Realistic distribution across their regions
- Tenant/leaseholder count proportional to portfolio
- Service charge complexity matching their services
- Financial transaction volume over 12 months
- Maintenance request volume
- Compliance records (gas, EICR, EPC)
- Estimated data import complexity

Also identify: pain points likely facing this company size, what features would benefit them most, and competitive positioning vs ${companyData.competitors?.slice(0, 2).join(' and ')}.`,
        response_json_schema: {
          type: 'object',
          properties: {
            demo_specification: {
              type: 'object',
              properties: {
                property_count: { type: 'number' },
                tenant_estimate: { type: 'number' },
                service_charges: { type: 'boolean' },
                transactions_12m: { type: 'number' },
                maintenance_tickets: { type: 'number' },
                compliance_records: { type: 'number' },
              },
            },
            pain_points: { type: 'array', items: { type: 'string' } },
            key_features: { type: 'array', items: { type: 'string' } },
            competitive_advantage: { type: 'string' },
            import_complexity: { type: 'string' },
          },
        },
      });
      setMatchResult(res);
      setPhase('generate');
    } finally {
      setMatching(false);
    }
  };

  const generateDemo = async () => {
    if (!companyData || !matchResult) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('buildAgentDemo', {
        properties: matchResult.demo_specification.property_count,
        company_name: companyData.company_name,
        regions: companyData.locations,
        services: companyData.services,
      });
      setDemoResult(res.data);
      setPhase('materials');
    } catch (error) {
      console.error('Error generating demo:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateMaterials = async () => {
    if (!companyData || !matchResult) return;
    setGeneratingMaterials(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 sales materials for ${companyData.company_name}:

1. ONE-PAGE ROI CALCULATOR:
   - Current portfolio: ${companyData.property_count} properties
   - Show time saved vs current system
   - Cost reduction estimate
   - Setup time needed
   - Quick reference format

2. IMPLEMENTATION TIMELINE:
   - Week 1-2: Setup (${matchResult.import_complexity} complexity)
   - Week 3-4: Data import & training
   - Week 5: Go-live
   - Include: Data prep checklist, support contacts, success criteria

3. COMPETITIVE POSITIONING BRIEF:
   - How Premiso vs ${companyData.competitors?.slice(0, 1).join(', ')}
   - Key differentiators for their size
   - Specific features they need
   - Customer success story from similar company`,
        response_json_schema: {
          type: 'object',
          properties: {
            roi_calculator: { type: 'string' },
            implementation_timeline: { type: 'string' },
            competitive_brief: { type: 'string' },
          },
        },
      });
      setMaterials(res);
      setPhase('share');
    } finally {
      setGeneratingMaterials(false);
    }
  };

  const createShareLink = async () => {
    try {
      // Generate shareable link with demo + materials
      const shareLinkData = {
        demo_id: demoResult?.company_id,
        prospect_name: companyData.company_name,
        materials: materials,
        generated_at: new Date().toISOString(),
      };
      setShareLink(`${window.location.origin}/?demo=${btoa(JSON.stringify(shareLinkData))}`);
    } catch (error) {
      console.error('Error creating share link:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Sales Targeted Demo Builder
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Research & Create Custom Demos</h1>
          <p className="text-muted-foreground mt-2">Look up any UK property company and instantly generate a high-fidelity demo matching their portfolio</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {DEMO_PHASES.map((p, i) => {
            const Icon = p.icon;
            const done = DEMO_PHASES.findIndex(ph => ph.id === phase) > i;
            const active = p.id === phase;
            return (
              <div key={p.id} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  done ? 'bg-green-100 text-green-700' :
                  active ? 'bg-primary text-primary-foreground' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{p.label}</span>
                </div>
                {i < DEMO_PHASES.length - 1 && <div className={`h-px w-3 shrink-0 ${done ? 'bg-green-300' : 'bg-slate-200'}`} />}
              </div>
            );
          })}
        </div>

        {/* Phase: Research */}
        {phase === 'research' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" /> Find Prospect Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter the name or company number of your prospect</p>
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCompany()}
                  placeholder="e.g., Local Lettings Ltd, Powell & Co, RBM Property"
                  className="flex-1"
                />
                <Button onClick={searchCompany} disabled={searching} className="gap-2">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Research
                </Button>
              </div>

              {companyData && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 mt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{companyData.company_name}</h3>
                      <p className="text-xs text-muted-foreground">{companyData.registered_address}</p>
                    </div>
                    <Badge>Found</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Portfolio</p>
                      <p className="font-semibold text-slate-800">~{companyData.property_count} properties</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Team Size</p>
                      <p className="font-semibold text-slate-800">{companyData.team_size}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {companyData.services?.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">Locations</p>
                      <p className="text-sm text-slate-700">{companyData.locations?.join(', ')}</p>
                    </div>
                  </div>

                  <Button onClick={analyzeAndMatch} disabled={matching} className="w-full gap-2" size="lg">
                    {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                    Analyze & Create Matching Demo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phase: Analyze */}
        {phase === 'analyze' && matchResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Demo Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Custom demo for {companyData.company_name} will include exactly {matchResult.demo_specification.property_count} properties
                  across {companyData.locations?.length || 1} region(s) with {matchResult.demo_specification.tenant_estimate} tenants
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Properties', value: matchResult.demo_specification.property_count },
                  { label: 'Tenants/Units', value: matchResult.demo_specification.tenant_estimate },
                  { label: 'Transactions (12m)', value: matchResult.demo_specification.transactions_12m },
                  { label: 'Maintenance Tickets', value: matchResult.demo_specification.maintenance_tickets },
                  { label: 'Compliance Records', value: matchResult.demo_specification.compliance_records },
                  { label: 'Service Charges', value: matchResult.demo_specification.service_charges ? 'Yes' : 'No' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {matchResult.pain_points && (
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-2">Pain Points This Demo Addresses:</p>
                  <ul className="space-y-1">
                    {matchResult.pain_points.map((p, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={generateDemo} disabled={generating} className="w-full gap-2" size="lg">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Custom Demo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phase: Generate */}
        {phase === 'generate' && demoResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Demo Generated!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Demo environment created for <strong>{companyData.company_name}</strong>
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {matchResult.demo_specification.property_count} properties, {matchResult.demo_specification.tenant_estimate} tenants,
                  {matchResult.demo_specification.transactions_12m} transactions
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-slate-800">Demo Ready:</p>
                <p className="text-xs text-slate-700">
                  Your prospect can now access the demo at: <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">{demoResult.demo_url}</code>
                </p>
              </div>

              <Button onClick={generateMaterials} disabled={generatingMaterials} className="w-full gap-2" size="lg">
                {generatingMaterials ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Generate Sales Materials
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phase: Materials */}
        {phase === 'materials' && materials && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Sales Materials Generated
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">ROI Calculator</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{materials.roi_calculator}</p>
                  <Button variant="outline" size="sm" className="mt-2 gap-1">
                    <Download className="w-3 h-3" /> Download PDF
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Implementation Timeline</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{materials.implementation_timeline}</p>
                  <Button variant="outline" size="sm" className="mt-2 gap-1">
                    <Download className="w-3 h-3" /> Download PDF
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-slate-900 mb-2">Competitive Positioning Brief</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{materials.competitive_brief}</p>
                  <Button variant="outline" size="sm" className="mt-2 gap-1">
                    <Download className="w-3 h-3" /> Download PDF
                  </Button>
                </div>
              </div>

              <Button onClick={createShareLink} className="w-full gap-2" size="lg">
                <Share2 className="w-4 h-4" /> Create Shareable Link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phase: Share */}
        {phase === 'share' && shareLink && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" /> Share Demo Package
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Demo + materials package ready to share with {companyData.company_name}
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Share this link:</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white p-2 rounded border text-xs text-slate-700 font-mono break-all">{shareLink}</code>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(shareLink)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-2">Package Includes:</p>
                <ul className="space-y-1">
                  <li>✓ Full demo environment ({matchResult.demo_specification.property_count} properties)</li>
                  <li>✓ ROI Calculator (customized for their size)</li>
                  <li>✓ Implementation Timeline ({matchResult.import_complexity} complexity)</li>
                  <li>✓ Competitive Positioning Brief</li>
                </ul>
              </div>

              <Button className="w-full gap-2" size="lg">
                <ExternalLink className="w-4 h-4" /> Open Demo to Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}