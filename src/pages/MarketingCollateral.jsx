import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, ArrowRight, Check, X, Crown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function MarketingCollateral() {
  const contentRef = useRef(null);
  const [orientation, setOrientation] = useState('landscape');

  const generatePDF = async () => {
    const element = contentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('Powell-Co-Marketing-Collateral.pdf');
  };

  const printContent = () => {
    document.title = 'Premiso-Marketing-Collateral-2026';
    const style = document.createElement('style');
    style.id = 'print-inject';
    style.textContent = `
      @page { size: A4 ${orientation}; margin: 15mm 12mm; }
      @media print {
        html, body { margin: 0; padding: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .print\\:hidden { display: none !important; }
        .border-2, .rounded-xl, .rounded-lg, .rounded, .p-6, .p-8,
        .bg-gradient-to-br, .bg-gradient-to-r, .bg-green-50, .bg-amber-50,
        .bg-amber-100, .bg-slate-50, .bg-slate-100, .bg-white {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        h2, h3, h4 { page-break-after: avoid !important; break-after: avoid !important; }
        .border-b-8 { page-break-after: always !important; break-after: page !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => { const s = document.getElementById('print-inject'); if (s) s.remove(); }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-blue-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Premiso Marketing Collateral</h1>
            <p className="text-sm text-slate-600">Complete Sales & Feature Overview Document</p>
          </div>
          <div className="flex gap-3 print:hidden items-center">
            <button
              onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              {orientation === 'portrait' ? '⬜ Portrait' : '▭ Landscape'} (click to toggle)
            </button>
            <Button onClick={printContent} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={generatePDF}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content for PDF/Print */}
      <div ref={contentRef} className="bg-white">
        {/* ===== SECTION 1: PRODUCT BROCHURE ===== */}
        <div className="p-12 space-y-8 border-b-8 border-blue-300">
          {/* Brochure Header */}
          <div className="text-center space-y-4">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
              SECTION 1: PRODUCT BROCHURE
            </div>
            <h2 className="text-5xl font-serif font-bold text-slate-900">Premiso</h2>
            <p className="text-2xl text-slate-600">Enterprise Property Management Platform</p>
            <p className="text-lg text-slate-500">Powered by Powell & Co Demo: 38 Companies | 13 Properties | 120+ Units</p>
          </div>

          {/* Eight Feature Sections */}
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                icon: '🏢',
                title: 'Lettings & Block Management',
                description: 'Manage ASTs, HMOs, leasehold blocks and RTM companies from a single login. All property types, all tenancy structures.',
                features: ['Tenancy pipeline & HMO licensing', 'Service charges & ground rent', 'RTM claim management', 'Building Safety Act 2023 register'],
              },
              {
                icon: '🛡️',
                title: 'Compliance & Certificate Hub',
                description: 'Track every statutory obligation in real time — gas certs, EICRs, fire risk, EPC, deposit registration and more.',
                features: ['Auto-expiry alerts per certificate', 'Full audit trail on every action', '14 compliance areas covered', 'Right to Rent & deposit tracking'],
              },
              {
                icon: '💰',
                title: 'Financial Management',
                description: 'Real-time rent ledger, arrears alerting, service charge accounts, and accounting sync with QuickBooks, Xero and Sage.',
                features: ['92%+ rent collection rate', 'Automated arrears notifications', 'QBO / Xero / Sage sync', 'Monthly landlord statement auto-send'],
              },
              {
                icon: '📱',
                title: 'Self-Service Portals',
                description: 'Dedicated portals for tenants, landlords, leaseholders and contractors. Reduce inbound queries by up to 70%.',
                features: ['Tenant rent payment & maintenance', 'Landlord statements & approvals', 'Leaseholder service charge access', 'Contractor mobile job portal'],
              },
              {
                icon: '🔧',
                title: 'Maintenance & Operations',
                description: 'Live Kanban job board from tenant report to invoice approval. Contractor dispatch, photo uploads and cost tracking.',
                features: ['Priority-based Kanban board', 'Contractor job pack dispatch', 'Before/after photo uploads', 'Invoice matching & approval'],
              },
              {
                icon: '📞',
                title: '24/7 Out-of-Hours Service',
                description: 'GDPR-compliant emergency call handling available standalone or fully integrated. Automatic maintenance order on every call.',
                features: ['Structured call logging & GDPR consent', 'Auto-maintenance order creation', 'Contractor dispatch from approved list', '34 calls/month avg · 97% resolved'],
              },
              {
                icon: '🏠',
                title: 'Residential Sales CRM',
                description: 'Full sales pipeline from valuation to completion. Listings, buyer portal, viewing management and agent leaderboards.',
                features: ['Listings & offer tracking pipeline', 'Buyer/seller CRM with follow-ups', 'Viewing scheduler & confirmation', 'Agent performance leaderboards'],
              },
              {
                icon: '📊',
                title: 'Automated Reporting',
                description: 'Branded reports auto-delivered to the right people at the right time — no manual compilation required.',
                features: ['Monthly landlord statements', 'Service charge accounts (quarterly)', 'Compliance digest (weekly)', 'Portfolio performance & yield reports'],
              },
            ].map((section, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-4xl mb-3">{section.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{section.title}</h3>
                <p className="text-sm text-slate-700 mb-4">{section.description}</p>
                <ul className="space-y-1">
                  {section.features.map((feature, fidx) => (
                    <li key={fidx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Platform at a Glance</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                 { label: 'Platform Modules', value: '18+' },
                 { label: 'Compliance Areas', value: '14+' },
                 { label: 'UK Law Compliant', value: '100%' },
                 { label: 'Go Live Time', value: '<2 wks' },
                 { label: 'Query Reduction', value: '70%' },
                 { label: 'OOH Response', value: '8 min' },
                 { label: 'Partner Commission', value: '20%' },
                 { label: 'Data Migration Cost', value: '£0' },
              ].map((metric, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-3xl font-bold text-blue-300">{metric.value}</p>
                  <p className="text-sm text-slate-300">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Framework */}
          <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">✓ Regulatory & Compliance Coverage</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>England Lettings:</strong> MEES (2018), Gas Safety Act (Annual CP12), EICR (5-yr), EPC, Deposit Protection (30-day), Right to Rent, How to Rent Guide</div>
              <div><strong>Block Management:</strong> Building Safety Act 2023, Section 20 Consultation (£250/unit), Leaseholder & Freehold Reform Act 2024, RTM (CLRA 2002), Client Money Protection</div>
              <div><strong>Wales & Corporate:</strong> Renting Homes (Wales) Act 2016, Rent Smart Wales, Companies House filing, Directors' returns, Confirmation Statements</div>
            </div>
          </div>
          
          {/* Personalised Demo Builder callout */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎯</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Personalised Demo Builder</h3>
                <p className="text-blue-200 text-sm leading-relaxed mb-3">
                  Every prospect gets a demo built with their real company data — pulled live from Companies House. Real directors, real company structure, real portfolio size. No generic demos. Just Premiso, set up exactly for them.
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full">Real CH API data</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full">Personalised in 5 mins</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full">48hr demo access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: PLATFORM TOUR ===== */}
        <div className="p-12 space-y-8 border-b-8 border-green-300">
          <div className="text-center space-y-4">
            <div className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-full text-sm font-semibold">
              SECTION 2: PLATFORM TOUR
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900">Complete Interface Overview</h2>
            <p className="text-slate-600">Page-by-page system walkthrough</p>
          </div>

          {/* Tour Pages */}
          <div className="space-y-6">
            {[
              {
                title: 'Executive Dashboard',
                subtitle: 'Portfolio Command Centre',
                metrics: ['Real-time KPIs', 'Compliance alerts', 'Rent collection rate', 'Open maintenance jobs'],
                features: ['Live portfolio overview', 'One-click alert resolution', 'Compliance traffic light system'],
              },
              {
                title: 'Compliance Hub',
                subtitle: 'Certificate Tracking',
                metrics: ['Gas Safety · EICR · EPC', 'Fire Risk · Asbestos', 'Deposit Registration', 'Right to Rent'],
                features: ['Auto-expiry alerts', 'Full audit trail', 'Certificate upload & delivery log'],
              },
              {
                title: 'Block & Leasehold Management',
                subtitle: 'Service Charge Accounts',
                metrics: ['Service charge budgets', 'Section 20 consultation', 'RTM claim management', 'Building Safety Register'],
                features: ['Leaseholder portal', 'Ground rent ledger', 'Reserve fund tracking'],
              },
              {
                title: 'Maintenance Kanban',
                subtitle: 'Live Job Board',
                metrics: ['Reported → In Progress → Done', 'Emergency priority routing', 'Contractor dispatch'],
                features: ['Photo upload by contractors', 'Invoice matching & approval', 'SLA response tracking'],
              },
              {
                title: 'Financial Dashboard',
                subtitle: 'Rent, SC & Banking',
                metrics: ['98%+ collection rate', 'Automated arrears alerts', 'QBO / Xero / Sage sync'],
                features: ['12-month income charts', 'Property profitability', 'One-click landlord statements'],
              },
              {
                title: 'Self-Service Portals',
                subtitle: 'Tenant · Landlord · Leaseholder · Contractor',
                metrics: ['70% fewer inbound calls', 'Rent payment online', 'Document self-serve'],
                features: ['Tenant maintenance submission', 'Landlord invoice approval', 'Contractor mobile job portal'],
              },
              {
                title: 'Out-of-Hours Call Centre',
                subtitle: '24/7 Emergency Management',
                metrics: ['34 calls/month avg', '8 min avg response', '97% resolved', 'GDPR logged'],
                features: ['Auto maintenance order on call close', 'Contractor dispatch', 'Full audit trail'],
              },
              {
                title: 'Residential Sales CRM',
                subtitle: 'From Valuation to Completion',
                metrics: ['Listings pipeline', 'Offer tracking', 'Agent leaderboards', 'Buyer portal'],
                features: ['Viewing scheduler & confirmation', 'Sales progression pipeline', 'Unified with lettings data'],
              },
            ].map((page, idx) => (
              <div key={idx} className="border-2 border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4">
                  <h3 className="text-xl font-bold">{page.title}</h3>
                  <p className="text-sm text-green-50">{page.subtitle}</p>
                </div>
                <div className="p-6 bg-slate-50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Key Metrics</p>
                      <div className="space-y-1">
                        {page.metrics.map((metric, midx) => (
                          <p key={midx} className="text-sm font-semibold text-slate-900">{metric}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Features</p>
                      <ul className="space-y-1">
                        {page.features.map((feature, fidx) => (
                          <li key={fidx} className="text-sm text-slate-700 flex items-center gap-2">
                            <span className="text-green-600">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECTION 3: PRODUCT COMPARISON ===== */}
        <div className="p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
              SECTION 3: COMPETITIVE ANALYSIS
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900">Market Comparison</h2>
            <p className="text-slate-600">Premiso vs. Industry Leaders</p>
          </div>

          {/* Competitor Overview */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Premiso', price: '£2-5K/mo', focus: 'UK Enterprise', highlight: true },
              { name: 'AppFolio', price: '£1.5-8K/mo', focus: 'Market Leader' },
              { name: 'Goodlord', price: '£50-300/mo', focus: 'Lettings' },
              { name: 'Keogh', price: '£100-400/mo', focus: 'UK Budget' },
              { name: 'Yardi', price: '£3-15K/mo', focus: 'Enterprise' },
              { name: 'Rent Manager', price: '£800-4K/mo', focus: 'US-Centric' },
            ].map((comp, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-4 border-2 ${
                  comp.highlight
                    ? 'bg-amber-100 border-amber-600'
                    : 'bg-slate-100 border-slate-300'
                }`}
              >
                <h3 className="font-bold text-slate-900">{comp.name}</h3>
                <p className="text-sm font-semibold text-slate-700 mt-1">{comp.price}</p>
                <p className="text-xs text-slate-600 mt-1">{comp.focus}</p>
              </div>
            ))}
          </div>

          {/* Feature Comparison Summary */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">Key Differentiators</h3>
            {[
              {
                powell: 'UK-first regulatory focus — Building Safety Act 2023, Renters\' Rights Bill, Leasehold Reform Act 2024',
                others: 'General-purpose with compliance bolt-ons, often US-origin platforms',
              },
              {
                powell: 'Lettings, block management AND residential sales in one unified system',
                others: 'Separate platforms for lettings and sales — duplicate data, no unified landlord view',
              },
              {
                powell: '4 self-service portals (tenant, landlord, leaseholder, contractor) — reduces inbound queries by 70%',
                others: 'Basic tenant portal only, often a chargeable add-on with limited functionality',
              },
              {
                powell: '24/7 out-of-hours call service built-in and available standalone — auto maintenance order on every call',
                others: 'No built-in out-of-hours solution — agents rely on personal mobiles with no audit trail',
              },
              {
                powell: 'Personalised demo builder using live Companies House data — unique to each prospect in 5 minutes',
                others: 'Generic product demos with no personalisation or real client data',
              },
              {
                powell: 'Automated reporting suite — landlord statements, SC accounts, compliance digest, portfolio yield',
                others: 'Manual report generation or expensive third-party add-ons required',
              },
            ].map((diff, idx) => (
              <div key={idx} className="border-l-4 border-amber-600 bg-amber-50 p-4 rounded">
                <p className="text-sm">
                  <strong className="text-amber-900">Premiso:</strong> {diff.powell}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  vs. <strong>Others:</strong> {diff.others}
                </p>
              </div>
            ))}
          </div>

          {/* TCO Comparison */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Annual TCO (250-Unit Portfolio)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded p-4 border-2 border-amber-300">
                <p className="font-bold text-slate-900">Premiso</p>
                <p className="text-2xl font-bold text-amber-700">£36,000/yr</p>
                <p className="text-xs text-slate-600 mt-2">All-inclusive, no module add-ons</p>
              </div>
              <div className="bg-white rounded p-4">
                <p className="font-bold text-slate-900">AppFolio</p>
                <p className="text-2xl font-bold text-slate-700">£48,000+/yr</p>
                <p className="text-xs text-slate-600 mt-2">Plus module fees</p>
              </div>
              <div className="bg-white rounded p-4">
                <p className="font-bold text-slate-900">Goodlord</p>
                <p className="text-2xl font-bold text-slate-700">£2,400+/yr</p>
                <p className="text-xs text-slate-600 mt-2">Lettings-focused only</p>
              </div>
            </div>
          </div>

          {/* When to Choose */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
              <h4 className="font-bold text-green-900 mb-3">✓ Choose Premiso When:</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ You manage lettings, blocks AND/OR sales — all in one system</li>
                <li>✓ Full UK regulatory compliance is non-negotiable</li>
                <li>✓ You want self-service portals for tenants, landlords and leaseholders</li>
                <li>✓ 24/7 out-of-hours cover is required (standalone or integrated)</li>
                <li>✓ Automated landlord reporting will save you significant admin time</li>
                <li>✓ You want a personalised demo built from your real company data</li>
              </ul>
            </div>
            <div className="bg-slate-50 border-2 border-slate-400 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-3">Alternative Options:</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>🔵 <strong>Goodlord:</strong> Simple lettings agents, basic AST management only</li>
                <li>🟣 <strong>AppFolio:</strong> US-origin market leader, high cost, limited UK compliance</li>
                <li>🟠 <strong>Reapit/Jupix:</strong> Traditional agent software, no block management</li>
                <li>🟢 <strong>Yardi:</strong> Enterprise mega-suites, 12-month implementation, very high TCO</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 text-white rounded-lg p-6 text-center text-sm">
            <p className="font-semibold mb-2">Premiso · The Complete UK Property Management Platform</p>
            <p>Lettings · Block Management · Sales · Compliance · Portals · Out-of-Hours · Reporting</p>
            <p className="text-slate-400 mt-3">Marketing Collateral · April 2026 · RBM (North West) Limited · 01204 695919 · info@rbm-nw.co.uk</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t-2 border-blue-300 p-6 print:hidden">
        <div className="max-w-7xl mx-auto flex gap-3 justify-center items-center">
          <button
            onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            {orientation === 'portrait' ? '⬜ Portrait' : '▭ Landscape'} (click to toggle)
          </button>
          <Button onClick={printContent} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print This Document
          </Button>
          <Button
            onClick={generatePDF}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}