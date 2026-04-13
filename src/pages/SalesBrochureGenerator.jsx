import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, Zap, Building2, Phone, FileX } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hex(h) {
  if (!h || h.length < 7) return '26, 58, 82';
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function Chip({ color, label }) {
  const map = { full: ['#16a34a', '✓ Fully Covered'], partial: ['#d97706', '◑ Partial'], addon: ['#7c3aed', '+ Add-on'] };
  const [bg, text] = map[color] || ['#6b7280', color];
  return <span style={{ background: bg, color: '#fff', fontSize: 9, padding: '3px 9px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>{text}</span>;
}

function SLabel({ color, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 4, height: 18, borderRadius: 99, background: color, flexShrink: 0 }} />
      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{text}</div>
    </div>
  );
}

function PHead({ primary, accent, title, subtitle, page }) {
  return (
    <div style={{ background: primary, padding: '18px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
      <div>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>premiso<span style={{ color: '#fff' }}>.</span></div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 10 }}>p.{page}</div>
      </div>
    </div>
  );
}

function PFoot({ agentName }) {
  return (
    <div style={{ padding: '10px 44px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ fontSize: 8.5, color: '#aaa' }}>Prepared exclusively for {agentName} · Confidential · Not for distribution</div>
      <div style={{ fontSize: 8.5, color: '#aaa' }}>premiso.co.uk · {new Date().getFullYear()}</div>
    </div>
  );
}

// ─── Static platform feature definitions ─────────────────────────────────────
const PLATFORM_FEATURES = [
  { icon: '📊', title: 'Portfolio Dashboard', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe',
    desc: 'Real-time KPIs across your entire portfolio — occupancy, arrears, income, maintenance status and compliance alerts, all on a single screen. Multi-company support means you see every legal entity you manage in one consolidated view.',
    badges: ['Multi-company', 'Real-time KPIs', 'Compliance alerts'] },
  { icon: '🏡', title: 'Residential Sales', color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    desc: 'Complete sales module — lead management, property listings, offer tracking, and sales progression pipeline. From initial enquiry through to exchange and completion, with full UK-specific workflow stages.',
    badges: ['Lead tracking', 'Sales pipeline', 'Offer management'] },
  { icon: '🏠', title: 'Tenancy Pipeline', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0',
    desc: 'Kanban-style board taking applicants from enquiry through referencing, move-in and all the way to renewal. Drag-and-drop simplicity with automated task prompts at each stage keeps your team on track without chasing spreadsheets.',
    badges: ['Kanban workflow', 'Referencing tracker', 'Renewal automation'] },
  { icon: '💷', title: 'Rent Ledger', color: '#b45309', bg: '#fefce8', border: '#fde68a',
    desc: 'Double-entry rent accounting per tenancy — every payment, arrear, credit and adjustment tracked against a full audit trail. Automated arrears escalation emails, payment plan management, and instant statement generation.',
    badges: ['Full audit trail', 'Arrears escalation', 'Payment plans'] },
  { icon: '✅', title: 'Compliance Hub', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0',
    desc: 'Gas safety, EICR, EPC, fire risk assessments, asbestos, legionella, PAT testing, lift safety — all tracked in one place with configurable expiry alerts. Building Safety Act 2023 register, accountable person records and resident communication log built in.',
    badges: ['BSA 2023 ready', '9 certificate types', 'Auto reminders'] },
  { icon: '🔧', title: 'Maintenance Orders', color: '#7e22ce', bg: '#fdf4ff', border: '#e9d5ff',
    desc: 'Log, assign, schedule and close maintenance jobs with full contractor dispatch. Preferred contractor lists, SMS/email notification, cost estimates vs actuals, Section 20 flagging for major works, and live status updates for tenants.',
    badges: ['Contractor dispatch', 'S.20 flagging', 'Cost tracking'] },
  { icon: '🏢', title: 'Block Management', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa',
    desc: 'First-class block management built in — not bolted on. Service charge accounts with budgeting, actuals and per-unit allocation. Section 20 consultation tracker. Ground rent register. RTM eligibility calculator. Leaseholder self-service portal.',
    badges: ['S.20 consultation', 'Ground rent', 'RTM management'] },
  { icon: '📄', title: 'Document Automation', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe',
    desc: 'Create, merge and send hundreds of documents in one click. Tenancy agreements, Section 21/8 notices, service charge statements, maintenance notices — all from your template library with live data fields auto-populated from your records.',
    badges: ['Mail merge', 'Bulk generation', 'Digital delivery'] },
  { icon: '📈', title: 'Financial Reporting', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0',
    desc: 'P&L, cashflow, income by property and by company. Bank transaction import and reconciliation. Owner statements. Expense tracking with receipt upload. Xero, Sage and QuickBooks-compatible exports — so your accountant gets what they need.',
    badges: ['Bank reconciliation', 'Owner statements', 'Xero/Sage export'] },
  { icon: '🏛️', title: 'Companies House API', color: '#b45309', bg: '#fefce8', border: '#fde68a',
    desc: 'No other property platform does this natively. Premiso connects directly to Companies House — pulling incorporation dates, directors, confirmation statement deadlines and accounts due dates automatically. Compliance calendar auto-populated, zero manual entry.',
    badges: ['Live CH data', 'Deadline alerts', 'Director tracking'] },
];

const INTEGRATIONS = [
  { logo: '🏠', name: 'Rightmove / Zoopla', category: 'Property Portals', color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    desc: 'Two-way integration with UK property portals. Premiso AUTOMATICALLY fetches the agent's current listings from Rightmove, Zoopla and OnTheMarket during demo setup — populating the sales module with REAL properties. Enquiries sync back automatically.', benefit: 'Real listings imported automatically — no manual data entry.' },
  { logo: '🟦', name: 'Xero', category: 'Accounting', color: '#1BA5E0', bg: '#e8f7fd', border: '#b3e5f7',
    desc: 'Two-way sync with Xero — transactions, rent receipts, service charge invoices and expenses post automatically. Your accountant sees clean, reconciled books without manual data entry.', benefit: 'Eliminate double-entry bookkeeping between your PM software and accounts.' },
  { logo: '🟧', name: 'Sage', category: 'Accounting', color: '#00DC82', bg: '#e6fdf4', border: '#b3f0d9',
    desc: 'Export-ready Sage-compatible data files at the click of a button. Supports Sage 50 and Sage Business Cloud — complete with nominal codes, cost centres and period mapping.', benefit: 'Your existing Sage workflow, now fed automatically by Premiso.' },
  { logo: '🟩', name: 'QuickBooks', category: 'Accounting', color: '#2CA01C', bg: '#edfce8', border: '#c3f0bc',
    desc: 'Full QuickBooks Online integration — bank feeds, expense categorisation, owner statement generation and VAT-ready exports. All reconciled automatically from your Premiso ledger.', benefit: 'Cut month-end close from days to hours.' },
  { logo: '🏛️', name: 'Companies House', category: 'Government', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe',
    desc: 'The only property platform with a native Companies House API. Director changes, accounts deadlines, confirmation statement dates and SIC codes are pulled live — no manual checking.', benefit: 'Never miss a filing deadline for any of your managed legal entities.' },
  { logo: '📧', name: 'Mailchimp / SendGrid', category: 'Communications', color: '#FFE01B', bg: '#fefce8', border: '#fde68a',
    desc: 'Bulk email campaigns to landlords, leaseholders or tenants. Sync contact lists from Premiso directly, trigger automated communications from workflow events, track open rates.', benefit: 'Communicate at scale without leaving your property data behind.' },
  { logo: '📱', name: 'Twilio / SMS', category: 'Communications', color: '#F22F46', bg: '#fff1f2', border: '#fecdd3',
    desc: 'Automated SMS notifications for rent reminders, maintenance updates, inspection schedules and emergency call confirmations — all triggered directly from workflow events in Premiso.', benefit: 'Tenants and leaseholders stay informed without any manual effort.' },
  { logo: '🔏', name: 'DPS / myDeposits / TDS', category: 'Deposits', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff',
    desc: 'Native integration with all three government-approved tenancy deposit schemes. Register deposits, issue prescribed information, manage disputes and track protection status — all within Premiso.', benefit: 'Stay legally compliant on every tenancy — no separate logins.' },
  { logo: '📂', name: 'DocuSign / e-Signature', category: 'Documents', color: '#FFCC00', bg: '#fefce8', border: '#fde68a',
    desc: 'Send tenancy agreements, compliance notices and legal documents for e-signature directly from Premiso. Full audit trail of who signed, when, and from where — legally binding.', benefit: 'Move tenants in faster — no printing, scanning or postal delays.' },
  { logo: '🔗', name: 'Open API / Zapier', category: 'Automation', color: '#FF4A00', bg: '#fff7ed', border: '#fed7aa',
    desc: 'Premiso exposes a full REST API and Zapier integration — connect to any tool in your business. CRMs, spreadsheets, appointment booking, phone systems, reporting dashboards.', benefit: 'Build your own workflows without waiting for us to build them.' },
];

const COMPETITOR_DEFAULTS = {
  competitor_names: ['Arthur Online', 'Jupix'],
  rows: [
    { feature: 'Residential Sales Module', premiso: 'Complete sales workflow — leads, listings, offers, progression pipeline', c1: 'Not available — lettings only', c2: 'Not available — lettings only', premiso_wins: true },
    { feature: 'Block Management', premiso: 'First-class — S.20, ground rent, RTM, leaseholder portal', c1: 'Basic — limited service charge capability', c2: 'Not included — requires separate software', premiso_wins: true },
    { feature: 'Companies House Integration', premiso: 'Native API — directors, deadlines, filings auto-synced', c1: 'Not available', c2: 'Not available', premiso_wins: true },
    { feature: 'Building Safety Act 2023', premiso: 'Full register, accountable person, resident comms log', c1: 'Not included', c2: 'Not included', premiso_wins: true },
    { feature: 'Out-of-Hours Service', premiso: '24/7 native add-on — call log, maintenance, dispatch', c1: 'Not available — requires third party', c2: 'Not available', premiso_wins: true },
    { feature: 'Document Automation', premiso: 'Mail merge, bulk generation, digital delivery', c1: 'Basic templates, no bulk generation', c2: 'Limited merge fields, manual only', premiso_wins: true },
    { feature: 'Financial Reporting', premiso: 'P&L, cashflow, bank reconciliation, owner statements', c1: 'Requires Xero separately', c2: 'Basic reports, no bank reconciliation', premiso_wins: true },
    { feature: 'Onboarding Time', premiso: 'Live in days — self-serve with support', c1: '4–8 weeks typical onboarding', c2: '2–6 weeks + migration fee', premiso_wins: true },
    { feature: 'Pricing Model', premiso: 'Transparent monthly — no annual lock-in', c1: 'Annual contract required', c2: 'Annual licence + setup fee', premiso_wins: true },
    { feature: 'UK Legislation Depth', premiso: 'RTM, S.20, BSA 2023, L&T Act 1985 — all built in', c1: 'Basic UK compliance', c2: 'Limited — US-influenced development', premiso_wins: true },
    { feature: 'All-in-One Platform', premiso: 'Lettings + Sales + Block + Compliance + Finance + OOH', c1: 'Lettings-focused, block is weak', c2: 'Lettings only — multiple tools needed', premiso_wins: true },
  ]
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesBrochureGenerator() {
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState(null);
  const [research, setResearch] = useState(null);
  const [expansion, setExpansion] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const paramAgent = params.get('agent');

  useEffect(() => {
    const stored = localStorage.getItem('premiso_brochure_data');
    if (stored) {
      const data = JSON.parse(stored);
      setResearch(data.research);
      setExpansion(data.expansion);
      setAgentName(data.agent_name || paramAgent || '');
    } else if (paramAgent) {
      setAgentName(paramAgent);
    }
  }, []);

  const brand = research?.brand || {};
  const PRIMARY = brand.primary_color || '#1a3a52';
  const ACCENT = brand.accent_color || '#f0ad4e';
  const RGB = hex(PRIMARY);

  const handleGenerate = async () => {
    if (!agentName) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateSalesBrochure', { agent_name: agentName, research, expansion });
      if (res.data?.success) setContent(res.data.content);
      else setError(res.data?.error || 'Generation failed');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!agentName && !research) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center text-slate-400 max-w-md">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-white mb-2">No Demo Data Found</p>
          <p className="text-sm mb-6">Build a demo first using the Sales Demo Setup page.</p>
          <Button onClick={() => window.location.href = '/sales-demo-setup'} className="bg-amber-500 hover:bg-amber-600 text-white">Go to Demo Builder</Button>
        </div>
      </div>
    );
  }

  const cmp = content?.competitor_comparison || COMPETITOR_DEFAULTS;

  return (
    <>
      <style>{`
        @media print { .no-print { display:none!important; } @page { size:A4; margin:0; } body { margin:0; padding:0; } .brochure-page { box-shadow:none!important; page-break-after:always; margin:0!important; } .print-wrapper { padding:0!important; } }
        .brochure-page { width:210mm; min-height:297mm; margin:0 auto 28px; background:#fff; overflow:hidden; position:relative; display:flex; flex-direction:column; font-family:${brand.font_hint ? `'${brand.font_hint}',` : ''}Inter,sans-serif; box-shadow:0 6px 32px rgba(0,0,0,0.18); }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <span className="text-white font-semibold">{agentName} — Sales Brochure</span>
          {research?.brand?.logo_url && (
            <img src={research.brand.logo_url} alt="" className="h-7 object-contain bg-white rounded px-1" onError={e => e.target.style.display = 'none'} />
          )}
        </div>
        <div className="flex items-center gap-3">
          {!content ? (
            <Button onClick={handleGenerate} disabled={generating} className="bg-amber-500 hover:bg-amber-600 text-white">
              {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Zap className="w-4 h-4 mr-2" />Generate AI Content</>}
            </Button>
          ) : (
            <>
              <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white">
                <Printer className="w-4 h-4 mr-2" />Print / Save PDF
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => { setContent(null); handleGenerate(); }}>
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="no-print bg-red-950 border border-red-700 rounded mx-8 mt-4 p-3 text-red-200 text-sm">{error}</div>}

      {generating && (
        <div className="no-print flex flex-col items-center justify-center py-24 bg-slate-900 min-h-96">
          <Loader2 className="w-14 h-14 text-amber-400 animate-spin mb-5" />
          <p className="text-white text-xl font-semibold">Crafting your personalised brochure…</p>
          <p className="text-slate-400 text-sm mt-2">Researching competitors, matching services, writing copy for {agentName}</p>
          <p className="text-slate-500 text-xs mt-1">Powered by Claude Sonnet — takes ~30–45 seconds</p>
        </div>
      )}

      {!content && !generating && (
        <div className="no-print bg-slate-900 min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: PRIMARY }}>
              <FileX className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Generate</h2>
            <p className="text-slate-400 mb-6">Click below to generate a full 8-page A4 brochure personalised for <strong className="text-white">{agentName}</strong> — featuring competitor analysis, service matching, feature breakdowns, OOH pitch and expansion roadmap.</p>
            <Button onClick={handleGenerate} size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8">
              <Zap className="w-5 h-5 mr-2" />Generate Brochure
            </Button>
          </div>
        </div>
      )}

      {content && (
        <div style={{ background: '#d1d5db', paddingTop: 0, paddingBottom: 60 }}>

          {/* ══ PAGE 1: COVER ══════════════════════════════════════════════════ */}
          <div className="brochure-page" style={{ background: PRIMARY }}>
            <div style={{ height: 8, background: ACCENT, flexShrink: 0 }} />

            {/* Logo bar */}
            <div style={{ padding: '32px 44px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                premiso<span style={{ color: ACCENT }}>.</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                {research?.brand?.logo_url && (
                  <img src={research.brand.logo_url} alt={agentName} style={{ height: 40, objectFit: 'contain', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', marginBottom: 6 }}
                    onError={e => e.target.style.display = 'none'} />
                )}
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prepared exclusively for</div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>{agentName}</div>
              </div>
            </div>

            {/* Hero */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 44px' }}>
              <div style={{ fontSize: 10.5, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 16 }}>
                Property Management Platform · UK
              </div>
              <h1 style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 20px', maxWidth: 520 }}>
                {content.cover_headline || `The Complete Platform Built for ${agentName}`}
              </h1>
              <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: 500, margin: '0 0 40px' }}>
                {content.cover_subheading || 'One platform. Every module. Built for UK property professionals who want to grow without the admin.'}
              </p>

              {/* Stats bar */}
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                {(content.stats || [
                  { value: '40%', label: 'Admin time saved' },
                  { value: '100%', label: 'UK legislation built-in' },
                  { value: '24/7', label: 'Emergency cover available' },
                  { value: '1 platform', label: 'For lettings & blocks' },
                ]).slice(0, 4).map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 22px', minWidth: 110 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT }}>{s.value}</div>
                    <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover footer strip */}
            <div style={{ padding: '20px 44px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Lettings · Block Management · Compliance · Finance · Out-of-Hours
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* ══ PAGE 2: EXECUTIVE SUMMARY + COMPANY PROFILE + PAIN POINTS ══ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Why Premiso — For You" subtitle={`Personalised analysis for ${agentName}`} page={2} />

            <div style={{ flex: 1, padding: '28px 44px', overflowHidden: 'hidden' }}>
              {/* Executive Summary */}
              <div style={{ marginBottom: 24, padding: '18px 22px', background: `rgba(${RGB},0.05)`, borderRadius: 12, border: `1.5px solid rgba(${RGB},0.15)` }}>
                <SLabel color={ACCENT} text="Executive Summary" />
                <p style={{ fontSize: 13, lineHeight: 1.8, color: '#1f2937', margin: 0 }}>
                  {content.executive_summary}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Company Profile */}
                <div>
                  <SLabel color={ACCENT} text="Company Profile" />
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <tbody>
                      {[
                        ['Company', research?.trading_name || agentName],
                        ['Location', research?.registered_address],
                        ['Established', research?.founded],
                        ['Website', research?.website],
                        ['Phone', research?.phone],
                        ['Services', (research?.services || []).slice(0, 3).join(', ')],
                      ].filter(r => r[1] && r[1] !== 'Not publicly available').map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '7px 0', color: '#6b7280', width: 90, fontWeight: 600, fontSize: 10.5 }}>{k}</td>
                          <td style={{ padding: '7px 0', color: '#111827', fontSize: 10.5 }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {research?.key_people?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <SLabel color={ACCENT} text="Key Contacts" />
                      {research.key_people.slice(0, 3).map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 6 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.name?.charAt(0) || '?'}</div>
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#111827' }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>{p.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pain Points */}
                <div>
                  <SLabel color={ACCENT} text="Challenges We Solve" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {(content.pain_points || []).slice(0, 6).map((p, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: '#fef9f0', borderRadius: 9, border: `1px solid rgba(${hex(ACCENT)},0.3)` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 3 }}>{p.problem}</div>
                        <div style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 600 }}>→ {p.solution}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 3: SERVICE MATCH TABLE ════════════════════════════════════ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Service Match" subtitle="Your services mapped to Premiso's modules" page={3} />

            <div style={{ flex: 1, padding: '24px 44px' }}>
              <SLabel color={ACCENT} text={`${agentName}'s Services → Premiso Coverage`} />
              <p style={{ fontSize: 11.5, color: '#374151', marginBottom: 14, lineHeight: 1.65 }}>
                Every service you offer today has a corresponding Premiso module that handles it — with deeper capability, better audit trails, and full compliance built in. Below is how your current business maps to the platform.
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: PRIMARY }}>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: 700, width: '22%' }}>Your Service</th>
                    <th style={{ padding: '10px 14px', color: ACCENT, textAlign: 'left', fontWeight: 700, width: '22%' }}>Premiso Module</th>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: 600, width: '44%' }}>What This Means for You</th>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'center', fontWeight: 600, width: '12%' }}>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {(content.feature_match || []).map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '9px 14px', fontWeight: 700, color: '#1f2937', fontSize: 11 }}>{row.their_service}</td>
                      <td style={{ padding: '9px 14px', color: PRIMARY, fontWeight: 700, fontSize: 11 }}>{row.premiso_module}</td>
                      <td style={{ padding: '9px 14px', color: '#374151', fontSize: 10.5, lineHeight: 1.5 }}>{row.benefit}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center' }}><Chip color={row.coverage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Coverage legend */}
              <div style={{ marginTop: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Coverage key:</div>
                <Chip color="full" />
                <div style={{ fontSize: 9.5, color: '#374151' }}>All functionality included in platform</div>
                <Chip color="partial" />
                <div style={{ fontSize: 9.5, color: '#374151' }}>Core covered, advanced modules available</div>
                <Chip color="addon" />
                <div style={{ fontSize: 9.5, color: '#374151' }}>Available as optional add-on</div>
              </div>
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 4: PLATFORM CAPABILITIES ══════════════════════════════════ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Platform Capabilities" subtitle="Everything in one place — no extra tools needed" page={4} />

            <div style={{ flex: 1, padding: '22px 44px' }}>
              <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.7, marginBottom: 18 }}>
                Most property management businesses are running 3–5 separate tools — a CRM, a maintenance app, a compliance tracker, a rent ledger, and something else for block management. Premiso replaces all of them with a single, connected platform where data flows seamlessly between every module.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {PLATFORM_FEATURES.map((mod, i) => (
                  <div key={i} style={{ background: mod.bg, border: `1.5px solid ${mod.border}`, borderRadius: 12, padding: '14px 15px 12px' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{mod.icon}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: mod.color, marginBottom: 5 }}>{mod.title}</div>
                    <p style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, margin: '0 0 8px' }}>{mod.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {mod.badges.map((b, j) => (
                        <span key={j} style={{ fontSize: 8.5, padding: '2px 7px', background: `${mod.color}18`, color: mod.color, borderRadius: 99, fontWeight: 700 }}>{b}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 4b: INTEGRATIONS ════════════════════════════════════════ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Integrations &amp; Connections" subtitle="Premiso works with the tools your business already relies on" page={5} />

            <div style={{ flex: 1, padding: '22px 44px' }}>
              <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.7, marginBottom: 18 }}>
                Premiso is designed to sit at the centre of your business — connected to your accounting software, your deposit schemes, your communications tools and government data sources. No more exporting spreadsheets or rekeying data between systems. Everything flows automatically.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
                {INTEGRATIONS.map((int, i) => (
                  <div key={i} style={{ background: int.bg, border: `1.5px solid ${int.border}`, borderRadius: 12, padding: '14px 15px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <div style={{ fontSize: 22 }}>{int.logo}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: int.color }}>{int.name}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{int.category}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 9.5, color: '#374151', lineHeight: 1.6, margin: '0 0 8px' }}>{int.desc}</p>
                    <div style={{ fontSize: 9.5, padding: '5px 9px', background: `${int.color}18`, color: int.color, borderRadius: 7, fontWeight: 700 }}>✓ {int.benefit}</div>
                  </div>
                ))}
              </div>

              {/* Integration summary banner */}
              <div style={{ background: PRIMARY, borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT, marginBottom: 5 }}>One Source of Truth</div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>
                    Every integration in Premiso is bi-directional where possible — data flows in and out without manual intervention. Your accounting software stays in sync with your rent ledger. Your deposit schemes are always up to date. Your tenants receive automated updates without anyone lifting a finger.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flexShrink: 0 }}>
                  {[{ v: '9+', l: 'Integrations' }, { v: 'REST', l: 'Open API' }, { v: '2-way', l: 'Data Sync' }, { v: 'Zapier', l: 'No-code Ready' }].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{s.v}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 5: MODULE SPOTLIGHTS (AI) ══════════════════════════════════ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Built for Your Business" subtitle={`How Premiso's key modules deliver for ${agentName}`} page={5} />

            <div style={{ flex: 1, padding: '28px 44px' }}>
              {/* Module highlights */}
              <SLabel color={ACCENT} text="Key Modules for Your Portfolio" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {(content.module_highlights || []).map((m, i) => (
                  <div key={i} style={{ border: `2px solid rgba(${RGB},0.15)`, borderRadius: 14, padding: '18px 20px', background: `rgba(${RGB},0.03)` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: PRIMARY, marginBottom: 5 }}>{m.module}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>{m.headline}</div>
                    <p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.65, margin: '0 0 10px' }}>{m.description}</p>
                    <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, padding: '6px 10px', background: '#f0fdf4', borderRadius: 7 }}>
                      ✓ Relevant because: {m.relevant_to}
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              {content.testimonial_placeholder && (
                <div style={{ background: PRIMARY, borderRadius: 14, padding: '22px 28px' }}>
                  <div style={{ fontSize: 32, color: ACCENT, lineHeight: 1, marginBottom: 8, fontFamily: 'Georgia, serif' }}>"</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>{content.testimonial_placeholder}</p>
                  <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    — Illustrative customer statement · Based on real agent outcomes
                  </div>
                </div>
              )}
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 6: COMPETITOR COMPARISON ══════════════════════════════════ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Why Premiso Wins" subtitle="Head-to-head with the alternatives you might be considering" page={6} />

            <div style={{ flex: 1, padding: '22px 44px' }}>
              <p style={{ fontSize: 11.5, color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>
                The UK proptech market is crowded — but most platforms were built for one thing (lettings, or maintenance, or referencing) and struggle with everything else. Premiso was designed from the ground up as a complete platform for professional UK property managers. Here's how we compare.
              </p>

              <SLabel color={ACCENT} text={`Premiso vs ${(cmp.competitor_names || ['Arthur Online', 'Jupix']).join(' & ')}`} />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: PRIMARY }}>
                    <th style={{ padding: '9px 12px', color: '#fff', textAlign: 'left', fontWeight: 600, width: '22%' }}>Feature</th>
                    <th style={{ padding: '9px 12px', color: ACCENT, textAlign: 'left', fontWeight: 800, width: '28%' }}>✦ Premiso</th>
                    {(cmp.competitor_names || ['Competitor A', 'Competitor B']).map((cn, i) => (
                      <th key={i} style={{ padding: '9px 12px', color: 'rgba(255,255,255,0.65)', textAlign: 'left', fontWeight: 600, width: '25%' }}>{cn}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(cmp.rows || []).map((row, i) => (
                    <tr key={i} style={{ background: row.premiso_wins ? (i % 2 === 0 ? '#f0fdf4' : '#dcfce7') : (i % 2 === 0 ? '#fff' : '#f9fafb'), borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1f2937', fontSize: 10.5 }}>{row.feature}</td>
                      <td style={{ padding: '8px 12px', color: '#15803d', fontWeight: 700, fontSize: 10.5 }}>
                        <span style={{ color: '#16a34a', marginRight: 4 }}>✓</span>{row.premiso}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: 10 }}>{row.c1}</td>
                      <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: 10 }}>{row.c2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Current tech stack */}
              {expansion?.existing_software?.length > 0 && (
                <div>
                  <SLabel color={ACCENT} text="Your Likely Current Tech Stack — Replaced by Premiso" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {expansion.existing_software.slice(0, 6).map((sw, i) => (
                      <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', background: '#fff' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1f2937' }}>{sw.name}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', margin: '2px 0' }}>{sw.category}</div>
                        <div style={{ fontSize: 9.5, color: '#374151' }}>{sw.description}</div>
                        {sw.has_api && <div style={{ marginTop: 4, fontSize: 9, color: '#16a34a', fontWeight: 600 }}>↔ API integration with Premiso possible</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 7: OUT-OF-HOURS ════════════════════════════════════════════ */}
          <div className="brochure-page">
            <div style={{ height: 8, background: ACCENT, flexShrink: 0 }} />

            <div style={{ flex: 1, padding: '30px 44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone style={{ width: 26, height: 26, color: ACCENT }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>Premium Add-On Service</div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: PRIMARY, margin: 0 }}>
                    {content.out_of_hours?.headline || '24/7 Out-of-Hours Emergency Cover'}
                  </h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32 }}>
                <div>
                  <SLabel color={ACCENT} text="Why This Matters for Your Business" />
                  <p style={{ fontSize: 12, lineHeight: 1.75, color: '#374151', marginTop: 4, marginBottom: 18 }}>
                    {content.out_of_hours?.why_relevant || `Every property manager faces the same problem: tenants don't have emergencies between 9 and 5. Boiler failures at 11pm on Christmas Eve, water leaks on a Sunday morning, lockouts at midnight. Without a dedicated out-of-hours service, these calls fall to you personally — or go unanswered, creating liability and damaging tenant relationships. Premiso's Out-of-Hours service is the only one that logs directly into your property management platform in real time.`}
                  </p>

                  <SLabel color={ACCENT} text="What's Included in Every Call" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {(content.out_of_hours?.benefits?.length ? content.out_of_hours.benefits : [
                      '24/7/365 UK-based call answering by trained property professionals',
                      'GDPR-compliant caller validation — property matched to your Premiso database on every call',
                      'Real-time call log created in Premiso — you see it instantly when you check in the morning',
                      'Automated maintenance order raised from every relevant call — no manual entry needed',
                      'Emergency contractor dispatch from our national network — plumbers, electricians, locksmiths',
                    ]).map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ color: '#16a34a', fontSize: 9, fontWeight: 800 }}>✓</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#1f2937', lineHeight: 1.55 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <SLabel color={ACCENT} text="Service Tiers" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {[
                      { tier: 'Basic', price: '£49/mo', desc: 'Call logging + instant email to property manager', highlight: false },
                      { tier: 'Standard', price: '£99/mo', desc: 'Maintenance order auto-created in Premiso', highlight: false },
                      { tier: 'Premium', price: '£179/mo', desc: 'Contractor dispatch + real-time Premiso sync', highlight: true },
                      { tier: 'Enterprise', price: 'POA', desc: 'Fully managed — bespoke SLA and escalation', highlight: false },
                    ].map((t, i) => (
                      <div key={i} style={{ border: `2px solid ${t.highlight ? ACCENT : '#e5e7eb'}`, borderRadius: 10, padding: '10px 14px', background: t.highlight ? `rgba(${hex(ACCENT)},0.07)` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.highlight ? PRIMARY : '#1f2937' }}>
                            {t.tier} {t.highlight && <span style={{ fontSize: 8.5, background: ACCENT, color: '#fff', padding: '2px 6px', borderRadius: 99, marginLeft: 4 }}>RECOMMENDED</span>}
                          </div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{t.desc}</div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: PRIMARY }}>{t.price}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: `rgba(${RGB},0.07)`, borderRadius: 10, padding: '12px 14px', border: `1px solid rgba(${RGB},0.15)`, marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: PRIMARY, textTransform: 'uppercase', marginBottom: 5 }}>Our Recommendation for {agentName}</div>
                    <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                      {content.out_of_hours?.tier_recommendation || 'Based on your portfolio profile and services, the Premium tier gives you full contractor dispatch with real-time Premiso integration — the most effective option for professional property managers handling residential and block portfolios.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[{ v: '24/7', l: 'Live Answering' }, { v: '<3 min', l: 'Response Time' }, { v: '100%', l: 'GDPR Compliant' }, { v: 'Live Sync', l: 'Into Premiso' }].map((s, i) => (
                      <div key={i} style={{ background: PRIMARY, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT }}>{s.v}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <PFoot agentName={agentName} />
          </div>

          {/* ══ PAGE 8: EXPANSION + NEXT STEPS ════════════════════════════════ */}
          <div className="brochure-page">
            <PHead primary={PRIMARY} accent={ACCENT} title="Growth Roadmap &amp; Next Steps" subtitle={`How Premiso grows with ${agentName}`} page={8} />

            <div style={{ flex: 1, padding: '24px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* Expansion */}
              <div>
                <SLabel color={ACCENT} text="Your Expansion Roadmap" />
                <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, marginBottom: 14 }}>
                  {content.expansion_narrative || `Premiso is built to scale with your business. As you add properties, expand into block management, or launch new service lines, the platform grows with you — no data migration, no new software, no additional per-user fees that spiral as your team grows.`}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {(content.expansion_opportunities || []).slice(0, 5).map((opp, i) => {
                    const tc = { '0-3 months': '#16a34a', '3-6 months': '#d97706', '6-12 months': '#7c3aed', '12+ months': '#dc2626' }[opp.timeline] || '#6b7280';
                    const ri = { low: '●○○', medium: '●●○', high: '●●●' }[opp.revenue_potential] || '●○○';
                    return (
                      <div key={i} style={{ border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1f2937', flex: 1, paddingRight: 8 }}>{opp.title}</div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: tc, padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>{opp.timeline}</span>
                        </div>
                        <p style={{ fontSize: 10, color: '#374151', lineHeight: 1.6, margin: '0 0 5px' }}>{opp.description}</p>
                        <div style={{ fontSize: 9.5, color: '#6b7280' }}>Revenue potential: <strong style={{ color: '#1f2937' }}>{ri} {opp.revenue_potential}</strong></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next steps */}
              <div>
                <SLabel color={ACCENT} text="Your Next Steps" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
                  {(content.next_steps?.length ? content.next_steps : [
                    { step: 'Explore Your Demo', description: 'Log into your personalised Premiso demo — populated with data matching your portfolio profile.' },
                    { step: 'Book a Live Walkthrough', description: 'Join a 45-minute call where we walk through every module relevant to your business.' },
                    { step: 'Data Migration Planning', description: 'We map your current data and plan a smooth, low-disruption migration to Premiso.' },
                    { step: 'Go Live', description: 'Onboard your team, go live within days — with dedicated support throughout.' },
                  ]).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{step.step}</div>
                        <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 2, lineHeight: 1.55 }}>{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA box */}
                <div style={{ background: PRIMARY, borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT, marginBottom: 7 }}>Book Your Live Demo</div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: '0 0 14px' }}>
                    We'll walk you through your {agentName}-specific demo environment — every module, every feature that matters to your portfolio.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 11, color: '#fff' }}>🌐 www.premiso.co.uk</div>
                    <div style={{ fontSize: 11, color: '#fff' }}>📧 hello@premiso.co.uk</div>
                    <div style={{ fontSize: 11, color: '#fff' }}>📞 Book a call via our website</div>
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ border: `2px solid rgba(${RGB},0.15)`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: PRIMARY, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Demo at a Glance</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Services Matched', value: content.feature_match?.length + '' || '10+' },
                      { label: 'Compliance Modules', value: '9' },
                      { label: 'Expansion Areas', value: content.expansion_opportunities?.length + '' || '5+' },
                      { label: 'Time to Go Live', value: 'Days' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY }}>{s.value}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Final footer */}
            <div style={{ margin: '0 44px 24px', paddingTop: 20, borderTop: `3px solid ${ACCENT}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: PRIMARY, letterSpacing: '-0.02em' }}>premiso<span style={{ color: ACCENT }}>.</span></div>
              <div style={{ fontSize: 9.5, color: '#9ca3af', textAlign: 'right', lineHeight: 1.6 }}>
                This brochure was generated specifically for {agentName}<br />
                Premiso Property Management Platform · premiso.co.uk · {new Date().getFullYear()}
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}