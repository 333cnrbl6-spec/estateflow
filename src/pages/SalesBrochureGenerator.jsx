import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, CheckCircle, AlertTriangle, Clock, FileX, DollarSign, Users, Shield, Zap, Phone, TrendingUp, Award, Building2, ChevronRight } from 'lucide-react';

const ICON_MAP = { Clock, AlertTriangle, FileX, DollarSign, Users, Shield, Zap, Phone, TrendingUp };

// ─── Helpers ────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  if (!hex) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function CoverageChip({ coverage }) {
  const map = { full: ['#22c55e', 'Fully Covered'], partial: ['#f59e0b', 'Partial'], addon: ['#8b5cf6', 'Add-on'] };
  const [bg, label] = map[coverage] || ['#6b7280', coverage];
  return <span style={{ background: bg, color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{label}</span>;
}

function WinChip({ wins }) {
  return wins
    ? <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 12 }}>✓ Premiso</span>
    : <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 11 }}>✗</span>;
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function SalesBrochureGenerator() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState(null);
  const [research, setResearch] = useState(null);
  const [expansion, setExpansion] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState(null);
  const printRef = useRef(null);

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
  const primaryColor = brand.primary_color || '#1a3a52';
  const accentColor = brand.accent_color || '#f0ad4e';
  const primaryRgb = hexToRgb(primaryColor);

  const handleGenerate = async () => {
    if (!agentName) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateSalesBrochure', {
        agent_name: agentName,
        research,
        expansion,
      });
      if (res.data?.success) {
        setContent(res.data.content);
      } else {
        setError(res.data?.error || 'Generation failed');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  if (!agentName && !research) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center text-slate-400 max-w-md">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-white mb-2">No Demo Data Found</p>
          <p className="text-sm mb-6">Please build a demo first using the Sales Demo Setup page.</p>
          <Button onClick={() => window.location.href = '/sales-demo-setup'} className="bg-amber-500 hover:bg-amber-600 text-white">
            Go to Demo Builder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .brochure-page {
            width: 210mm;
            min-height: 297mm;
            page-break-after: always;
            margin: 0;
            box-shadow: none !important;
          }
          body { margin: 0; padding: 0; }
          @page { size: A4; margin: 0; }
        }
        @media screen {
          .brochure-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.18);
          }
        }
        .brochure-page { background: #fff; overflow: hidden; position: relative; font-family: ${brand.font_hint ? `'${brand.font_hint}', ` : ''}Inter, sans-serif; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <span className="text-white font-semibold">{agentName} — Sales Brochure</span>
          {research?.brand?.logo_url && (
            <img src={research.brand.logo_url} alt="" className="h-7 object-contain bg-white rounded px-1" onError={e => e.target.style.display='none'} />
          )}
        </div>
        <div className="flex items-center gap-3">
          {!content && (
            <Button onClick={handleGenerate} disabled={generating} className="bg-amber-500 hover:bg-amber-600 text-white">
              {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</> : <><Zap className="w-4 h-4 mr-2" /> Generate Brochure</>}
            </Button>
          )}
          {content && (
            <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white">
              <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
            </Button>
          )}
          {content && (
            <Button variant="outline" size="sm" onClick={() => { setContent(null); handleGenerate(); }} className="border-slate-600 text-slate-300">
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="no-print bg-red-950 border border-red-700 rounded mx-8 mt-4 p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {generating && (
        <div className="no-print flex flex-col items-center justify-center py-24 bg-slate-900 min-h-96">
          <Loader2 className="w-14 h-14 text-amber-400 animate-spin mb-5" />
          <p className="text-white text-xl font-semibold">Crafting your brochure…</p>
          <p className="text-slate-400 text-sm mt-2">Using AI to tailor content specifically for {agentName}</p>
          <p className="text-slate-500 text-xs mt-1">This uses Claude Sonnet and takes ~30 seconds</p>
        </div>
      )}

      {!content && !generating && (
        <div className="no-print bg-slate-900 min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: primaryColor }}>
              <FileX className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Generate</h2>
            <p className="text-slate-400 mb-2">
              A full A4 colour brochure tailored for <strong className="text-white">{agentName}</strong> — including their services, competitor analysis, feature match, out-of-hours pitch, and expansion opportunities.
            </p>
            {research && (
              <div className="flex flex-wrap gap-2 justify-center mt-4 mb-6">
                {(research.services || []).slice(0, 5).map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">{s}</span>
                ))}
              </div>
            )}
            <Button onClick={handleGenerate} size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8">
              <Zap className="w-5 h-5 mr-2" /> Generate Brochure
            </Button>
          </div>
        </div>
      )}

      {content && (
        <div ref={printRef} style={{ background: '#e5e7eb', paddingTop: 32, paddingBottom: 48 }}>

          {/* ══ PAGE 1: COVER ══════════════════════════════════════════════ */}
          <div className="brochure-page" style={{ background: primaryColor, display: 'flex', flexDirection: 'column' }}>
            {/* Header stripe */}
            <div style={{ height: 8, background: accentColor }} />

            {/* Logo area */}
            <div style={{ padding: '36px 44px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                {research?.brand?.logo_url && (
                  <img src={research.brand.logo_url} alt={agentName} style={{ height: 44, objectFit: 'contain', background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '4px 10px' }}
                    onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prepared exclusively for</div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>{agentName}</div>
              </div>
            </div>

            {/* Centre content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 44px' }}>
              <div style={{ fontSize: 11, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 18 }}>
                Property Management Platform
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 20px', maxWidth: 520 }}>
                {content.cover_headline || `The Complete Platform Built for ${agentName}`}
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 480, margin: '0 0 40px' }}>
                {content.cover_subheading || 'Discover how Premiso transforms property management — tailored to your portfolio, your team, your growth.'}
              </p>

              {/* Key stats bar */}
              {content.stats && (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {content.stats.slice(0, 4).map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 22px', minWidth: 120 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: accentColor }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cover footer */}
            <div style={{ padding: '24px 44px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                premiso<span style={{ color: accentColor }}>.</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Confidential — {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* ══ PAGE 2: EXECUTIVE SUMMARY + COMPANY PROFILE ══════════════ */}
          <div className="brochure-page" style={{ display: 'flex', flexDirection: 'column' }}>
            <PageHeader primary={primaryColor} accent={accentColor} title="About Your Demo" subtitle={`Tailored for ${agentName}`} pageNum={2} />
            <div style={{ flex: 1, padding: '32px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

              {/* Executive Summary */}
              <div style={{ gridColumn: '1 / -1' }}>
                <SectionLabel color={accentColor} text="Executive Summary" />
                <p style={{ fontSize: 13, lineHeight: 1.75, color: '#374151', marginTop: 10 }}>
                  {content.executive_summary || `${agentName} is a UK property management company. Premiso has been tailored specifically for their portfolio, services and team to demonstrate exactly how the platform would work for them from day one.`}
                </p>
              </div>

              {/* Company Profile */}
              <div>
                <SectionLabel color={accentColor} text="Company Profile" />
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 11 }}>
                  <tbody>
                  {[
                    ['Company', research?.trading_name || agentName],
                    ['Location', research?.registered_address],
                    ['Est.', research?.founded],
                    ['Website', research?.website],
                    ['Phone', research?.phone],
                  ].filter(r => r[1] && r[1] !== 'Not publicly available').map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '6px 0', color: '#6b7280', width: 90, fontWeight: 600 }}>{k}</td>
                      <td style={{ padding: '6px 0', color: '#111827' }}>{v}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* Key People */}
              {research?.key_people?.length > 0 && (
                <div>
                  <SectionLabel color={accentColor} text="Key Contacts" />
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {research.key_people.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: primaryColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: '#6b7280' }}>{p.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              <div style={{ gridColumn: '1 / -1' }}>
                <SectionLabel color={accentColor} text="Services We've Matched to Premiso" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {(research?.services || []).map((s, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '4px 10px', background: `rgba(${primaryRgb},0.08)`, color: primaryColor, borderRadius: 99, border: `1px solid rgba(${primaryRgb},0.2)`, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Pain Points */}
              {(content.pain_points?.length > 0) && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <SectionLabel color={accentColor} text="Challenges We Solve for You" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                    {content.pain_points.slice(0, 6).map((p, i) => (
                      <div key={i} style={{ background: '#fef9f0', border: `1px solid ${accentColor}33`, borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: 4 }}>Challenge</div>
                        <div style={{ fontSize: 11, color: '#1f2937', fontWeight: 600, marginBottom: 6 }}>{p.problem || '—'}</div>
                        <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>→ {p.solution || 'Resolved by Premiso'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <PageFooter primary={primaryColor} accent={accentColor} agentName={agentName} />
          </div>

          {/* ══ PAGE 3: SERVICE MATCH TABLE ═══════════════════════════════ */}
          <div className="brochure-page">
            <PageHeader primary={primaryColor} accent={accentColor} title="Service Match" subtitle="How your services map to Premiso's platform" pageNum={3} />
            <div style={{ padding: '24px 44px 0' }}>
              <SectionLabel color={accentColor} text={`${agentName} Services → Premiso Coverage`} />
              {(!content.feature_match || content.feature_match.length === 0) && (
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12 }}>Service match data will appear here once the brochure is generated.</p>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 11 }}>
                <thead>
                  <tr style={{ background: primaryColor }}>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: 600 }}>Your Service</th>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: 600 }}>Premiso Module</th>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: 600 }}>Key Benefit</th>
                    <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'center', fontWeight: 600 }}>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {(content.feature_match || []).map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '9px 14px', color: '#111827', fontWeight: 600 }}>{row.their_service}</td>
                      <td style={{ padding: '9px 14px', color: primaryColor, fontWeight: 600 }}>{row.premiso_module}</td>
                      <td style={{ padding: '9px 14px', color: '#374151' }}>{row.benefit}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center' }}><CoverageChip coverage={row.coverage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Module Highlights */}
              {content.module_highlights && (
                <div style={{ marginTop: 28 }}>
                  <SectionLabel color={accentColor} text="Spotlight: Key Modules for Your Business" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
                    {content.module_highlights.slice(0, 4).map((m, i) => (
                      <div key={i} style={{ border: `2px solid rgba(${primaryRgb},0.15)`, borderRadius: 12, padding: '16px 18px', background: `rgba(${primaryRgb},0.03)` }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: primaryColor, marginBottom: 4 }}>{m.module}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>{m.headline}</div>
                        <p style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{m.description}</p>
                        <div style={{ marginTop: 8, fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
                          ✓ {m.relevant_to}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <PageFooter primary={primaryColor} accent={accentColor} agentName={agentName} />
          </div>

          {/* ══ PAGE 4: MODULE VISUALS — App Capability Showcase ═════════ */}
          <div className="brochure-page">
            <PageHeader primary={primaryColor} accent={accentColor} title="Platform Capabilities" subtitle="A visual overview of the Premiso platform" pageNum={4} />
            <div style={{ padding: '24px 44px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { title: 'Portfolio Dashboard', desc: 'Real-time KPIs, occupancy rates, income tracking and compliance alerts across your entire portfolio.', icon: '📊', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
                  { title: 'Tenancy Pipeline', desc: 'Manage prospects, referencing, move-ins and renewals through a visual Kanban pipeline.', icon: '🏠', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
                  { title: 'Rent Ledger', desc: 'Full rent accounting, arrears tracking, payment history and automated reminders per tenancy.', icon: '💷', bg: '#fefce8', border: '#fde68a', color: '#b45309' },
                  { title: 'Compliance Suite', desc: 'Gas safety, EICR, EPC, fire safety, asbestos and Building Safety Act in one compliance hub.', icon: '✅', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
                  { title: 'Maintenance Orders', desc: 'Log, assign, track and close maintenance jobs with contractor dispatch and cost tracking.', icon: '🔧', bg: '#fdf4ff', border: '#e9d5ff', color: '#7e22ce' },
                  { title: 'Service Charges', desc: 'Block management service charge accounts, S.20 consultation, per-unit allocations and reserve funds.', icon: '🏢', bg: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
                  { title: 'Document Engine', desc: 'Mail-merge templates, bulk generation, tenancy agreements, statutory notices and compliance docs.', icon: '📄', bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
                  { title: 'Financial Reporting', desc: 'P&L, cashflow, income by property, expense categorisation and accountancy export.', icon: '📈', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
                  { title: 'Leaseholder Portal', desc: 'Self-service access for leaseholders to view accounts, service charges, documents and raise requests.', icon: '👥', bg: '#fefce8', border: '#fde68a', color: '#b45309' },
                ].map((mod, i) => (
                  <div key={i} style={{ background: mod.bg, border: `1.5px solid ${mod.border}`, borderRadius: 12, padding: '16px 16px 14px' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{mod.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: mod.color, marginBottom: 5 }}>{mod.title}</div>
                    <p style={{ fontSize: 10, color: '#374151', lineHeight: 1.55, margin: 0 }}>{mod.desc}</p>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              {content.testimonial_placeholder && (
                <div style={{ marginTop: 22, background: primaryColor, borderRadius: 14, padding: '22px 28px', position: 'relative' }}>
                  <div style={{ fontSize: 36, color: accentColor, lineHeight: 1, marginBottom: 8, fontFamily: 'Georgia, serif' }}>"</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>{content.testimonial_placeholder}</p>
                  <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    — Illustrative customer statement
                  </div>
                </div>
              )}
            </div>
            <PageFooter primary={primaryColor} accent={accentColor} agentName={agentName} />
          </div>

          {/* ══ PAGE 5: COMPETITOR COMPARISON ════════════════════════════ */}
          <div className="brochure-page">
            <PageHeader primary={primaryColor} accent={accentColor} title="Why Premiso" subtitle="Head-to-head comparison with market alternatives" pageNum={5} />
            <div style={{ padding: '24px 44px' }}>
              {!content.competitor_comparison && (
                <div style={{ padding: '24px', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Competitor comparison is generated during brochure creation based on the prospect's likely tech stack.</p>
                </div>
              )}
              {!expansion?.existing_software?.length && (
                <div style={{ marginTop: 24, padding: '16px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>No existing tech stack detected</div>
                  <p style={{ fontSize: 10, color: '#374151', margin: 0 }}>Premiso can serve as the primary platform for {agentName}, replacing fragmented spreadsheets and legacy tools with a single integrated solution.</p>
                </div>
              )}
              {content.competitor_comparison && (
                <>
                  <SectionLabel color={accentColor} text={`Premiso vs ${(content.competitor_comparison.competitor_names || ['Competitor A', 'Competitor B']).join(' & ')}`} />
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, fontSize: 10.5 }}>
                    <thead>
                      <tr style={{ background: primaryColor }}>
                        <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'left', fontWeight: 600, width: '28%' }}>Feature</th>
                        <th style={{ padding: '10px 12px', color: accentColor, textAlign: 'left', fontWeight: 700, width: '22%' }}>✦ Premiso</th>
                        {(content.competitor_comparison.competitor_names || ['Competitor A', 'Competitor B']).map((cn, i) => (
                          <th key={i} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)', textAlign: 'left', fontWeight: 600, width: '22%' }}>{cn}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(content.competitor_comparison.rows || []).map((row, i) => (
                        <tr key={i} style={{ background: row.premiso_wins ? (i % 2 === 0 ? '#f0fdf4' : '#dcfce7') : (i % 2 === 0 ? '#fff' : '#f9fafb'), borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1f2937' }}>{row.feature}</td>
                          <td style={{ padding: '8px 12px', color: '#15803d', fontWeight: row.premiso_wins ? 700 : 400 }}>
                            {row.premiso_wins && <span style={{ color: '#16a34a', marginRight: 4 }}>✓</span>}
                            {row.premiso}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#6b7280' }}>{row.c1}</td>
                          <td style={{ padding: '8px 12px', color: '#6b7280' }}>{row.c2}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Existing software they use */}
              {expansion?.existing_software?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <SectionLabel color={accentColor} text="Your Likely Current Tech Stack" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
                    {expansion.existing_software.slice(0, 6).map((sw, i) => (
                      <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', background: '#fff' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1f2937' }}>{sw.name}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', margin: '2px 0' }}>{sw.category}</div>
                        <div style={{ fontSize: 10, color: '#374151' }}>{sw.description}</div>
                        {sw.has_api && <div style={{ marginTop: 4, fontSize: 9, color: '#16a34a', fontWeight: 600 }}>↔ API available — integration possible</div>}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: '#6b7280', marginTop: 10, fontStyle: 'italic' }}>
                    Premiso is designed to integrate with or replace these platforms, reducing duplication and cutting software costs.
                  </p>
                </div>
              )}
            </div>
            <PageFooter primary={primaryColor} accent={accentColor} agentName={agentName} />
          </div>

          {/* ══ PAGE 6: OUT OF HOURS ══════════════════════════════════════ */}
          <div className="brochure-page">
            <div style={{ height: 8, background: accentColor }} />
            <div style={{ padding: '36px 44px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone style={{ width: 24, height: 24, color: accentColor }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>Premium Add-On Service</div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: primaryColor, margin: 0 }}>
                    {content.out_of_hours?.headline || 'Out-of-Hours Emergency Cover'}
                  </h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
                <div>
                  <SectionLabel color={accentColor} text="Why This Matters for You" />
                  <p style={{ fontSize: 12.5, lineHeight: 1.7, color: '#374151', marginTop: 10, marginBottom: 20 }}>
                    {content.out_of_hours?.why_relevant || `As a property management company, ${agentName} will inevitably face out-of-hours emergency calls from tenants — boiler failures, water leaks, security issues. Without a dedicated service, these calls go unanswered or fall to directors and staff outside of working hours. Premiso's Out-of-Hours add-on removes that burden entirely.`}
                  </p>

                  <SectionLabel color={accentColor} text="What's Included" />
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(content.out_of_hours?.benefits?.length ? content.out_of_hours.benefits : ['24/7 emergency call handling by trained property professionals', 'Real-time call logging directly into Premiso', 'Automated maintenance order creation on every call', 'GDPR-validated caller identification on every call']).map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ color: '#16a34a', fontSize: 10, fontWeight: 700 }}>✓</span>
                        </div>
                        <span style={{ fontSize: 11.5, color: '#1f2937' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Service Tiers */}
                  <SectionLabel color={accentColor} text="Service Tiers" />
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { tier: 'Basic', price: '£49/mo', desc: 'Call logging + email alerts', highlight: false },
                      { tier: 'Standard', price: '£99/mo', desc: 'Auto maintenance order creation', highlight: false },
                      { tier: 'Premium', price: '£179/mo', desc: 'Contractor dispatch included', highlight: true },
                      { tier: 'Enterprise', price: 'POA', desc: 'Fully managed service', highlight: false },
                    ].map((t, i) => (
                      <div key={i} style={{ border: `2px solid ${t.highlight ? accentColor : '#e5e7eb'}`, borderRadius: 10, padding: '10px 14px', background: t.highlight ? `rgba(${hexToRgb(accentColor)},0.06)` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: t.highlight ? primaryColor : '#1f2937' }}>
                            {t.tier} {t.highlight && <span style={{ fontSize: 9, background: accentColor, color: '#fff', padding: '2px 6px', borderRadius: 99, marginLeft: 4 }}>RECOMMENDED</span>}
                          </div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{t.desc}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: primaryColor }}>{t.price}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 14, background: `rgba(${primaryRgb},0.06)`, borderRadius: 10, padding: '12px 14px', border: `1px solid rgba(${primaryRgb},0.15)` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: primaryColor, textTransform: 'uppercase', marginBottom: 4 }}>Our Recommendation for You</div>
                    <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, margin: 0 }}>{content.out_of_hours?.tier_recommendation || 'Based on your portfolio size and services, the Premium tier provides full contractor dispatch with real-time Premiso integration — the most effective option for professional property managers.'}</p>
                  </div>

                  {/* OOH Stats */}
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { v: '24/7', l: 'Live Answering' }, { v: '< 3 min', l: 'Response Time' },
                      { v: '100%', l: 'GDPR Compliant' }, { v: 'Real-time', l: 'Premiso Sync' },
                    ].map((s, i) => (
                      <div key={i} style={{ background: primaryColor, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: accentColor }}>{s.v}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <PageFooter primary={primaryColor} accent={accentColor} agentName={agentName} />
          </div>

          {/* ══ PAGE 7: EXPANSION OPPORTUNITIES ══════════════════════════ */}
          <div className="brochure-page">
            <PageHeader primary={primaryColor} accent={accentColor} title="Expansion Opportunities" subtitle="How Premiso grows with your business" pageNum={7} />
            <div style={{ padding: '24px 44px' }}>
              <p style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.7, marginBottom: 24 }}>
                {content.expansion_narrative || `Premiso is designed to grow alongside ${agentName}. As the platform evolves, new modules and integrations will open additional revenue streams and service capabilities, ensuring long-term platform value.`}
              </p>

              <SectionLabel color={accentColor} text="Your Growth Roadmap with Premiso" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
                {(content.expansion_opportunities || []).map((opp, i) => {
                  const timelineColor = { '0-3 months': '#16a34a', '3-6 months': '#d97706', '6-12 months': '#7c3aed', '12+ months': '#dc2626' }[opp.timeline] || '#6b7280';
                  const revenueIcons = { low: '●○○', medium: '●●○', high: '●●●' }[opp.revenue_potential] || '●○○';
                  return (
                    <div key={i} style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', background: '#fff', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', flex: 1, paddingRight: 8 }}>{opp.title}</div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: timelineColor, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{opp.timeline}</span>
                      </div>
                      <p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, margin: '0 0 8px' }}>{opp.description}</p>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>Revenue potential: <span style={{ color: '#1f2937', fontWeight: 700 }}>{revenueIcons} {opp.revenue_potential}</span></div>
                    </div>
                  );
                })}
              </div>

              {expansion?.integration_opportunities?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <SectionLabel color={accentColor} text="Integration Opportunities" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                    {expansion.integration_opportunities.slice(0, 6).map((int, i) => (
                      <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: primaryColor, marginBottom: 4 }}>{int.title}</div>
                        <div style={{ fontSize: 10, color: '#374151' }}>{int.description}</div>
                        <div style={{ marginTop: 6, fontSize: 9, color: '#6b7280' }}>Priority: <strong style={{ color: { high: '#dc2626', medium: '#d97706', low: '#6b7280' }[int.priority] || '#6b7280' }}>{int.priority}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <PageFooter primary={primaryColor} accent={accentColor} agentName={agentName} />
          </div>

          {/* ══ PAGE 8: NEXT STEPS ═══════════════════════════════════════ */}
          <div className="brochure-page" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 8, background: accentColor }} />
            <div style={{ flex: 1, padding: '44px 44px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              <div>
                <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Ready to get started?</div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: primaryColor, lineHeight: 1.2, margin: '0 0 20px' }}>
                  Your Next Steps with Premiso
                </h2>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
                  We've built a complete demo environment specifically for {agentName}. Every module has been populated with realistic data from your portfolio profile so you can explore Premiso as it would look on day one of going live.
                </p>

                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(content.next_steps?.length ? content.next_steps : [
                    { step: 'Review Your Demo', description: 'Log into your personalised Premiso demo environment and explore your portfolio data.' },
                    { step: 'Book a Walkthrough', description: 'Join a live call with our team to see every module tailored to your business.' },
                    { step: 'Data Migration Planning', description: 'We map your existing data to Premiso and plan a smooth migration.' },
                    { step: 'Go Live', description: 'Your team is onboarded, data is live, and you start saving time from day one.' },
                  ]).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: primaryColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>{step.step}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* Contact block */}
                <div style={{ background: primaryColor, borderRadius: 16, padding: '28px 28px', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: accentColor, marginBottom: 6 }}>Book Your Live Demo</div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 18px' }}>
                    Join a personalised walkthrough of your {agentName} demo environment. We'll show every feature that matters to your business.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, color: '#fff' }}>🌐 www.premiso.co.uk</div>
                    <div style={{ fontSize: 11, color: '#fff' }}>📧 hello@premiso.co.uk</div>
                    <div style={{ fontSize: 11, color: '#fff' }}>📞 Book a call via our website</div>
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ border: `2px solid rgba(${primaryRgb},0.15)`, borderRadius: 14, padding: '20px 22px' }}>
                  <SectionLabel color={accentColor} text="Your Demo at a Glance" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                    {[
                      { label: 'Services Covered', value: content.feature_match?.filter(f => f.coverage === 'full').length + '+' || '10+' },
                      { label: 'Compliance Modules', value: '8' },
                      { label: 'Integration Options', value: expansion?.integration_opportunities?.length + '+' || '5+' },
                      { label: 'Expansion Areas', value: content.expansion_opportunities?.length || '6' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: primaryColor }}>{s.value}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Final footer */}
            <div style={{ margin: '0 44px 28px', marginTop: 'auto', paddingTop: 24, borderTop: `3px solid ${accentColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: primaryColor, letterSpacing: '-0.02em' }}>
                premiso<span style={{ color: accentColor }}>.</span>
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right' }}>
                This brochure was generated specifically for {agentName}<br />
                Premiso Property Management Platform · {new Date().getFullYear()}
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function PageHeader({ primary, accent, title, subtitle, pageNum }) {
  return (
    <div style={{ background: primary, padding: '20px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>premiso<span style={{ color: '#fff' }}>.</span></div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 12 }}>p. {pageNum}</div>
      </div>
    </div>
  );
}

function PageFooter({ primary, accent, agentName }) {
  return (
    <div style={{ marginTop: 'auto', padding: '12px 44px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 9, color: '#9ca3af' }}>Prepared exclusively for {agentName} · Confidential</div>
      <div style={{ fontSize: 9, color: '#9ca3af' }}>premiso.co.uk · {new Date().getFullYear()}</div>
    </div>
  );
}

function SectionLabel({ color, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 4, height: 16, borderRadius: 99, background: color, flexShrink: 0 }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{text}</div>
    </div>
  );
}