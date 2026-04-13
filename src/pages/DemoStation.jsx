import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Crown, ChevronLeft, ChevronRight, Loader2, Zap,
  Building2, Home, Users, PoundSterling, Wrench, Shield, Phone,
  FileText, BarChart3, Globe, Lightbulb, AlertTriangle, ExternalLink,
  Sparkles, Play, Package, Link2 } from 'lucide-react';

// ── Demo data watermark badge ──────────────────────────────────────────────
function DemoBadge({ label = 'Generated Demo Data' }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-300 rounded px-1.5 py-0.5 ml-2">
      <AlertTriangle className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ── Section: no demo yet ───────────────────────────────────────────────────
function NoDemoYet({ onBuild }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full border-2 border-amber-200 bg-amber-50">
        <CardContent className="pt-10 pb-10 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">No Agent Demo Built Yet</h2>
          <p className="text-sm text-muted-foreground">
            The Demo Station shows a fully personalised sales environment built around a real letting agent.
            Start by building a demo for your target agent — Premiso will research them and create live data.
          </p>
          <Button onClick={onBuild} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
            <Play className="w-4 h-4" />
            Build Agent Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Section: Agent Overview header ────────────────────────────────────────
function AgentHeader({ report, counts }) {
  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">{report.agent_name}</h2>
              <Badge variant="outline" className="text-xs">Demo Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{report.agent_summary}</p>
            {report.services_overview && (
              <p className="text-xs text-muted-foreground mt-1 italic">{report.services_overview}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-center">
            {[
              { label: 'Companies', value: counts.companies, icon: '🏛️' },
              { label: 'Properties', value: counts.properties, icon: '🏢' },
              { label: 'Units', value: counts.units, icon: '🏠' },
              { label: 'Tenants', value: counts.tenants, icon: '👥' },
            ].map(s => (
              <div key={s.label} className="bg-background border rounded-lg px-4 py-2 min-w-[70px]">
                <div className="text-lg">{s.icon}</div>
                <div className="text-lg font-bold">{s.value ?? '…'}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(report.services || []).slice(0, 8).map((svc, i) => {
            const scope = typeof svc === 'object' ? svc.scope : 'in_scope';
            const name = typeof svc === 'object' ? svc.name : svc;
            const colours = {
              in_scope: 'bg-green-100 text-green-700 border-green-200',
              buildable: 'bg-amber-100 text-amber-700 border-amber-200',
              integration: 'bg-blue-100 text-blue-700 border-blue-200',
              out_of_scope: 'bg-slate-100 text-slate-500 border-slate-200',
            };
            return (
              <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${colours[scope] || colours.in_scope}`}>
                {name}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Section: Live Demo Links ───────────────────────────────────────────────
function LiveDemoLinks({ agentName }) {
  const links = [
    { label: 'Dashboard', path: '/', icon: BarChart3, desc: 'Portfolio overview with real counts' },
    { label: 'Companies', path: '/companies', icon: Building2, desc: 'Company structure & directors' },
    { label: 'Properties', path: '/properties', icon: Home, desc: 'Properties & addresses' },
    { label: 'Units & Leases', path: '/units', icon: Home, desc: 'Unit breakdown & tenure' },
    { label: 'Tenants', path: '/tenants', icon: Users, desc: 'Active tenants & status' },
    { label: 'Rent Ledger', path: '/rent-ledger', icon: PoundSterling, desc: 'Financial transactions' },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench, desc: 'Maintenance orders' },
    { label: 'Compliance', path: '/compliance', icon: Shield, desc: 'Certificates & regulatory status' },
    { label: 'CRM', path: '/crm', icon: FileText, desc: 'Contact & interaction log' },
    { label: 'Out-of-Hours', path: '/out-of-hours', icon: Phone, desc: 'Call handling module' },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">Live Platform Sections</h3>
        <DemoBadge label="Real + Generated Data" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(l => (
          <a key={l.path} href={l.path}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group">
            <l.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">{l.label}</p>
              <p className="text-xs text-muted-foreground">{l.desc}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        All data shown in these sections was either researched from public sources or generated to fill gaps.
        Researched data is accurate; generated data is illustrative only.
      </p>
    </div>
  );
}

// ── Section: Platform Tour (agent-personalised) ────────────────────────────
function AgentTour({ report, counts }) {
  const [slide, setSlide] = useState(0);
  const name = report.agent_name;
  const slides = [
    {
      title: 'Dashboard', subtitle: 'Portfolio Overview',
      desc: `${name} portfolio summary — ${counts.companies || 1} company, ${counts.properties || 3} properties, ${counts.units || 15} units under management.`,
      metrics: [
        { label: 'Companies', value: String(counts.companies || 1), icon: '🏛️' },
        { label: 'Properties', value: String(counts.properties || 3), icon: '🏢' },
        { label: 'Units', value: String(counts.units || 15), icon: '📦' },
        { label: 'Tenants', value: String(counts.tenants || 10), icon: '👥' },
      ],
      isDemo: true,
    },
    {
      title: 'Properties', subtitle: 'Portfolio Holdings',
      desc: `${name} properties: realistic addresses and postcodes based on their operating area, with unit breakdown and occupancy status.`,
      metrics: [
        { label: 'Properties', value: String(counts.properties || 3), icon: '🏢' },
        { label: 'Units', value: String(counts.units || 15), icon: '🏠' },
        { label: 'Occupied', value: `${Math.round((counts.units || 15) * 0.88)}`, icon: '✓' },
        { label: 'Vacant', value: `${Math.round((counts.units || 15) * 0.12)}`, icon: '⬜' },
      ],
      isDemo: true,
    },
    {
      title: 'Rent Ledger', subtitle: 'Financial Transactions',
      desc: `Rent collection tracking for ${name} tenants — monthly income, arrears alerts and payment history.`,
      metrics: [
        { label: 'Transactions', value: `${(counts.tenants || 10) * 3}+`, icon: '💷' },
        { label: 'Collection Rate', value: '94%', icon: '✓' },
        { label: 'Avg Rent', value: '£850/mo', icon: '📈' },
        { label: 'Arrears', value: '0', icon: '✅' },
      ],
      isDemo: true,
    },
    {
      title: 'Compliance', subtitle: 'Certificate & Regulatory Tracking',
      desc: `All certificates tracked for ${name} properties: Gas Safety, EICR, EPC, Fire Risk Assessments and deposit protection.`,
      metrics: [
        { label: 'Gas Certs', value: String(counts.properties || 3), icon: '🔥' },
        { label: 'EICRs', value: String(counts.properties || 3), icon: '⚡' },
        { label: 'EPCs', value: String(counts.units || 15), icon: '🌿' },
        { label: 'Deposits Protected', value: String(counts.tenants || 10), icon: '🛡️' },
      ],
      isDemo: true,
    },
    {
      title: 'Maintenance', subtitle: 'Operations & Contractor Management',
      desc: `Maintenance orders raised for ${name} properties — priority tracking, contractor assignment and resolution.`,
      metrics: [
        { label: 'Open Orders', value: '3', icon: '🔧' },
        { label: 'Urgent', value: '1', icon: '🚨' },
        { label: 'Contractors', value: '4', icon: '👷' },
        { label: 'Avg Resolution', value: '12d', icon: '⏱️' },
      ],
      isDemo: true,
    },
    {
      title: 'Out-of-Hours', subtitle: '24/7 Emergency Call Handling',
      desc: `Dedicated out-of-hours service for ${name} tenants — GDPR-logged calls, contractor dispatch and automatic maintenance order creation.`,
      metrics: [
        { label: 'Coverage', value: '24/7', icon: '📞' },
        { label: 'Avg Response', value: '<4 min', icon: '⚡' },
        { label: 'GDPR Logging', value: '✓', icon: '🔒' },
        { label: 'Auto Orders', value: '✓', icon: '⚙️' },
      ],
      isDemo: false,
    },
  ];
  const s = slides[slide];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold">Platform Tour</h3>
        {s.isDemo && <DemoBadge label="Populated with demo data" />}
      </div>
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
          <h4 className="text-lg font-bold font-serif">{s.title}</h4>
          <p className="text-sm text-slate-300">{s.subtitle}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-sm text-slate-700">{s.desc}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {s.metrics.map((m, i) => (
              <div key={i} className="bg-slate-50 border rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="text-lg font-bold mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${i === slide ? 'w-6 bg-primary' : 'w-2 bg-slate-300'}`} />
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setSlide(s => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ── Section: One-Pager (agent-personalised) ───────────────────────────────
function AgentOnePager({ report, counts }) {
  const name = report.agent_name;
  const inScopeServices = (report.services || []).filter(s => typeof s === 'object' ? s.scope === 'in_scope' : true);
  const buildableServices = (report.services || []).filter(s => typeof s === 'object' && s.scope === 'buildable');
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold">One-Page Summary — {name}</h3>
        <DemoBadge label="Personalised for demo" />
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => window.print()}>
          🖨️ Print / PDF
        </Button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden shadow">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-serif text-2xl font-bold">Premiso</div>
              <div className="text-xs tracking-widest text-slate-400 uppercase mt-0.5">Property Management Platform</div>
            </div>
            <div className="text-right text-sm text-slate-300">
              <div className="font-semibold text-white">{name}</div>
              <div>{report.agent_location}</div>
              <div className="text-sky-400 text-xs font-semibold mt-0.5">Demo Proposal</div>
            </div>
          </div>
        </div>
        {/* Hero */}
        <div className="px-8 py-5 bg-slate-50 border-b-2 border-primary/30">
          <div className="text-xs font-semibold uppercase tracking-widest text-sky-600 mb-1">Tailored for {name}</div>
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">
            The Complete UK Property Management Platform — Built Around Your Business.
          </h2>
          <p className="text-sm text-slate-600">
            Premiso covers everything {name} does today, plus the tools to grow — from lettings and block management
            to compliance, financials, 24/7 out-of-hours and custom-built modules for your specific services.
          </p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-5 bg-slate-900 text-white">
          {[
            { n: String(counts.properties || 3), l: 'Demo Properties' },
            { n: String(counts.units || 15), l: 'Demo Units' },
            { n: '100%', l: 'UK Compliant' },
            { n: '24/7', l: 'Emergency Cover' },
            { n: '<2wk', l: 'Go Live' },
          ].map((s, i) => (
            <div key={i} className="text-center py-4 border-r border-white/10 last:border-0">
              <div className="text-xl font-bold text-sky-400">{s.n}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="grid grid-cols-2 gap-6 px-8 py-6">
          <div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 border-b pb-1">Services in Premiso Today</div>
            <div className="space-y-1">
              {inScopeServices.slice(0, 8).map((svc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  {typeof svc === 'object' ? svc.name : svc}
                </div>
              ))}
            </div>
            {buildableServices.length > 0 && (
              <>
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-4 mb-2 border-b pb-1">
                  ⚡ Buildable for {name}
                </div>
                {buildableServices.slice(0, 4).map((svc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700 mb-1">
                    <span className="text-amber-500 font-bold shrink-0">+</span>
                    <span>
                      {svc.name}
                      {svc.build_notes && <span className="text-xs text-slate-500 ml-1">({svc.build_notes})</span>}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 border-b pb-1">Why {name} Should Switch</div>
            {[
              { icon: '🚨', text: `Never miss a compliance deadline — gas certs, EICRs, fire assessments auto-tracked for all your properties.` },
              { icon: '💰', text: `Full financial control — rent ledger, service charges, banking and accounting sync in one place.` },
              { icon: '📞', text: `24/7 out-of-hours call handling — GDPR-logged, contractor dispatch, and auto maintenance orders.` },
              { icon: '⏱️', text: `Save 8+ hours/week on admin through workflow automation and document generation.` },
            ].map((b, i) => (
              <div key={i} className="flex gap-2 mb-3 text-sm">
                <span className="text-lg shrink-0 leading-tight">{b.icon}</span>
                <span className="text-slate-600 leading-snug">{b.text}</span>
              </div>
            ))}
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-3 mb-2 border-b pb-1">Simple Monthly Pricing</div>
            {[
              { name: 'Starter', units: 'Up to 50 units', price: '£149/mo' },
              { name: 'Professional ★', units: 'Up to 200 units', price: '£349/mo' },
              { name: 'Enterprise', units: 'Unlimited', price: '£749+/mo' },
            ].map((p, i) => (
              <div key={i} className={`flex justify-between text-sm px-2 py-1.5 rounded mb-1 ${i === 1 ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'}`}>
                <span className="font-semibold">{p.name} <span className="font-normal text-slate-500 text-xs">{p.units}</span></span>
                <span className="font-bold text-primary">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center text-sm">
          <div className="font-serif font-bold">Book a Free Demo <span className="text-sky-400">Personalised for {name}</span></div>
          <div className="text-slate-400 text-xs">hello@premiso.co.uk · premiso.co.uk</div>
        </div>
      </div>
    </div>
  );
}

// ── Section: Comparison (with agent's existing software highlighted) ───────
function AgentComparison({ report }) {
  const agentSoftware = (report.existing_software || []).map(s => s.name);
  const competitors = ['Premiso', 'Goodlord', 'Alto/Jupix', 'Reapit', 'Yardi'];
  const featureRows = [
    { name: 'Multi-property portfolio', p: true, g: true, a: true, r: true, y: true },
    { name: 'Block management & service charges', p: true, g: false, a: false, r: false, y: true },
    { name: 'RTM & leaseholder portal', p: true, g: false, a: false, r: false, y: false },
    { name: 'UK compliance auto-tracking', p: true, g: true, a: true, r: true, y: true },
    { name: 'Building Safety Act 2023 register', p: true, g: false, a: false, r: false, y: false },
    { name: '24/7 out-of-hours call handling', p: true, g: false, a: false, r: false, y: false },
    { name: 'Maintenance order management', p: true, g: true, a: true, r: true, y: true },
    { name: 'Full financial & rent ledger', p: true, g: false, a: true, r: true, y: true },
    { name: 'Accounting sync (QuickBooks/Xero)', p: true, g: false, a: true, r: true, y: true },
    { name: 'Workflow automation engine', p: true, g: false, a: false, r: false, y: true },
    { name: 'White-label tenant portal', p: true, g: false, a: false, r: true, y: true },
    { name: 'UK pricing (SMB-friendly)', p: true, g: true, a: false, r: false, y: false },
    { name: 'Buildable custom modules', p: true, g: false, a: false, r: false, y: false },
  ];
  const vals = row => [row.p, row.g, row.a, row.r, row.y];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold">Competitive Comparison</h3>
      </div>
      {agentSoftware.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <span className="font-semibold text-blue-800">Software detected for this agent: </span>
          <span className="text-blue-700">{agentSoftware.join(', ')}</span>
          <span className="text-blue-600 ml-2 text-xs">(highlighted where relevant below)</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium w-64">Feature</th>
              {competitors.map((c, i) => (
                <th key={c} className={`text-center py-2 px-3 text-xs font-semibold ${i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  {c}
                  {agentSoftware.some(s => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase().split('/')[0])) && (
                    <div className="text-[9px] text-blue-600 font-normal">↑ detected</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureRows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-muted/20">
                <td className="py-2 px-3 text-xs font-medium">{row.name}</td>
                {vals(row).map((v, j) => (
                  <td key={j} className={`text-center py-2 px-3 ${j === 0 ? 'bg-primary/5' : ''}`}>
                    {v ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-slate-200 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Feature data based on publicly available information as of 2026. Verify with vendors for current accuracy.</p>
    </div>
  );
}

// ── Section: Expansion Opportunities ──────────────────────────────────────
function AgentExpansion({ report }) {
  const SCOPE_COLOURS = {
    in_scope: 'bg-green-100 text-green-800 border-green-300',
    buildable: 'bg-amber-100 text-amber-800 border-amber-300',
    integration: 'bg-blue-100 text-blue-800 border-blue-300',
    out_of_scope: 'bg-slate-100 text-slate-600 border-slate-300',
  };
  const SCOPE_LABELS = {
    in_scope: '✓ In Premiso',
    buildable: '⚡ Buildable',
    integration: '🔌 Integration',
    out_of_scope: 'Outside Scope',
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(SCOPE_LABELS).map(([k, v]) => (
          <span key={k} className={`text-xs px-2 py-0.5 rounded-full border ${SCOPE_COLOURS[k]}`}>{v}</span>
        ))}
      </div>

      {/* Services */}
      {(report.services || []).length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Services Scope Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.services.map((svc, i) => (
              <Card key={i}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{svc.name || svc}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${SCOPE_COLOURS[svc.scope] || SCOPE_COLOURS.in_scope}`}>
                          {SCOPE_LABELS[svc.scope] || '✓ In Premiso'}
                        </span>
                      </div>
                      {svc.description && <p className="text-xs text-muted-foreground">{svc.description}</p>}
                      {svc.build_notes && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1.5">💡 {svc.build_notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing software */}
      {(report.existing_software || []).length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Software They Likely Use
          </h4>
          <div className="space-y-2">
            {report.existing_software.map((sw, i) => (
              <Card key={i}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-semibold text-sm">{sw.name}</span>
                        <Badge variant="outline" className="text-xs">{sw.category}</Badge>
                        {sw.pricing && <span className="text-xs text-muted-foreground">💷 {sw.pricing}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{sw.description}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${sw.has_api ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                          {sw.has_api ? '✓ API Available' : '✗ No API'}
                        </span>
                        {sw.integration_type && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">🔌 {sw.integration_type}</span>}
                        {sw.confidence && <span className="text-xs text-muted-foreground">{sw.confidence}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Integration opportunities */}
      {(report.integration_opportunities || []).length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5" /> Integration Opportunities
          </h4>
          <div className="space-y-2">
            {report.integration_opportunities.map((opp, i) => (
              <Card key={i} className={`border-l-4 ${opp.priority === 'high' ? 'border-l-green-500' : opp.priority === 'medium' ? 'border-l-amber-500' : 'border-l-slate-300'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{opp.title}</span>
                        <Badge variant="outline" className="text-xs">{opp.priority} priority</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opp.description}</p>
                      {opp.technical_approach && <p className="text-xs text-blue-600 mt-1">🔧 {opp.technical_approach}</p>}
                    </div>
                    {opp.effort && <span className="text-xs text-muted-foreground shrink-0">{opp.effort}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {report.recommendation && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-900 mb-1">Sales Recommendation</p>
              <p className="text-sm text-amber-800">{report.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Main DemoStation ───────────────────────────────────────────────────────
export default function DemoStation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        // Load latest expansion report
        const reports = await base44.entities.AgentExpansionReport.list('-created_date', 1);
        if (reports?.length) setReport(reports[0]);

        // Load real counts
        const [companies, properties, units, tenants] = await Promise.all([
          base44.entities.Company.list('-created_date', 1),
          base44.entities.Property.list('-created_date', 100),
          base44.entities.Unit.list('-created_date', 100),
          base44.entities.Tenant.list('-created_date', 100),
        ]);
        setCounts({
          companies: companies?.length || 0,
          properties: properties?.length || 0,
          units: units?.length || 0,
          tenants: tenants?.length || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" /> Demo Station
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Sales & demonstrator environment — personalised per agent</p>
        </div>
        <NoDemoYet onBuild={() => navigate('/sales-demo-setup')} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" /> Demo Station
          </h1>
          <p className="text-muted-foreground text-sm">Personalised sales environment for <strong>{report.agent_name}</strong></p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/sales-demo-setup')} className="gap-1">
          <Zap className="w-3.5 h-3.5" /> Build New Demo
        </Button>
      </div>

      {/* Demo data notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Demo Data Notice:</strong> This environment contains a mix of researched public data
          (company names, addresses, directors, services) and <strong>generated illustrative data</strong> created to fill
          gaps during demo build (property names, tenant names, financial figures, maintenance orders).
          Generated data is clearly labelled <DemoBadge /> throughout. All data is for demonstration purposes only.
        </span>
      </div>

      <AgentHeader report={report} counts={counts} />

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="live">🔗 Live Demo</TabsTrigger>
          <TabsTrigger value="tour">🖥️ Platform Tour</TabsTrigger>
          <TabsTrigger value="onepager">📄 One-Pager</TabsTrigger>
          <TabsTrigger value="comparison">⚖️ Comparison</TabsTrigger>
          <TabsTrigger value="expansion">💡 Expansion</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <LiveDemoLinks agentName={report.agent_name} />
        </TabsContent>
        <TabsContent value="tour" className="mt-4">
          <AgentTour report={report} counts={counts} />
        </TabsContent>
        <TabsContent value="onepager" className="mt-4">
          <AgentOnePager report={report} counts={counts} />
        </TabsContent>
        <TabsContent value="comparison" className="mt-4">
          <AgentComparison report={report} />
        </TabsContent>
        <TabsContent value="expansion" className="mt-4">
          <AgentExpansion report={report} />
        </TabsContent>
      </Tabs>
    </div>
  );
}