import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, ArrowRight, Check, X, Crown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function MarketingCollateral() {
  const contentRef = useRef(null);

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
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-blue-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">EstateFlow Marketing Collateral</h1>
            <p className="text-sm text-slate-600">Complete Sales & Feature Overview Document</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <Button
              onClick={printContent}
              variant="outline"
              className="gap-2"
            >
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
            <h2 className="text-5xl font-serif font-bold text-slate-900">EstateFlow</h2>
            <p className="text-2xl text-slate-600">Enterprise Property Management Platform</p>
            <p className="text-lg text-slate-500">Unified solution for modern portfolio management</p>
          </div>

          {/* Six Feature Sections */}
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                icon: '🏢',
                title: 'Portfolio Management',
                description: 'Manage 250+ properties, 1000+ units across multiple companies and regions with real-time visibility.',
                features: ['Multi-company groups', 'Company House integration', 'Automated compliance tracking'],
              },
              {
                icon: '💰',
                title: 'Financial Management',
                description: 'Complete accounting integration with real-time P&L, 12-month trends, and collection analytics.',
                features: ['QuickBooks & Xero sync', 'Automated reconciliation', 'Advanced reporting'],
              },
              {
                icon: '⚖️',
                title: 'Compliance & Audit',
                description: 'Full regulatory compliance with Gas Safety, EPC, MEES, deposit protection, and audit trails.',
                features: ['Bulk document generation', 'Automated expiry alerts', 'Jurisdiction support (England/Wales)'],
              },
              {
                icon: '👥',
                title: 'Tenant Experience',
                description: 'White-label tenant portal with secure document access, payment history, and maintenance requests.',
                features: ['Mobile-friendly portal', 'Secure notifications', 'Document management'],
              },
              {
                icon: '🔧',
                title: 'Operations Hub',
                description: 'Streamlined maintenance tracking with priority scheduling and contractor management.',
                features: ['Workflow automation', 'Priority-based routing', 'CRM integration'],
              },
              {
                icon: '🔗',
                title: 'API & Integrations',
                description: 'Extensible platform with webhooks, custom API, and third-party service connectors.',
                features: ['Webhook support', 'Auto-sync scheduling', 'Service connectors'],
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
            <h3 className="text-2xl font-bold mb-6">Platform Capabilities</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Properties', value: '250+' },
                { label: 'Units', value: '1000+' },
                { label: 'Companies', value: '35+' },
                { label: 'Compliance Checks', value: '50+' },
                { label: 'Integration Points', value: '12+' },
                { label: 'Audit Events', value: '10K+' },
                { label: 'Documents Generated', value: '8000+' },
                { label: 'Tenant Accounts', value: '2400+' },
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
            <h3 className="text-xl font-bold text-slate-900 mb-4">✓ Regulatory & Compliance Framework</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>England Lettings:</strong> MEES (2018), Gas Safety Act, EPC, Deposit Protection, How to Rent</div>
              <div><strong>Wales Lettings:</strong> Renting Homes (Wales) Act 2016, FFHH Standard, Rent Smart Wales</div>
              <div><strong>Corporate:</strong> Companies House filing, Directors' returns, Confirmation Statements</div>
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
                title: 'Dashboard',
                subtitle: 'Portfolio Overview & Key Metrics',
                metrics: ['35 Companies', '250 Properties', '92% Occupancy', '£2.4M Income'],
                features: ['Real-time analytics', 'Compliance alerts', 'Maintenance tracking'],
              },
              {
                title: 'Companies',
                subtitle: 'Corporate Structure Management',
                metrics: ['35 Companies', '33 Active', '8 Accounts Due'],
                features: ['Company House integration', 'Director tracking', 'Filing deadlines'],
              },
              {
                title: 'Properties & Units',
                subtitle: 'Portfolio Holdings',
                metrics: ['250 Properties', '1000+ Units', '92% Occupancy'],
                features: ['Unit tracking', 'Lease management', 'Rent ledgers'],
              },
              {
                title: 'Financial Reporting',
                subtitle: 'Advanced Analytics & Trends',
                metrics: ['£2.4M Income', '92% Collection', '38% Cost Ratio'],
                features: ['12-month trends', 'Occupancy analysis', 'Forecasting'],
              },
              {
                title: 'Compliance Audit',
                subtitle: 'Regulatory Tracking',
                metrics: ['18 Active Audits', '1,240 Logs', '8,450 Documents'],
                features: ['Audit trails', 'Bulk document generation', 'Deadline tracking'],
              },
              {
                title: 'Tenant Portal',
                subtitle: 'White-Label Self-Service',
                metrics: ['2,400 Accounts', '87% Login Rate', '280 Requests/mo'],
                features: ['Secure access', 'Payment history', 'Maintenance requests'],
              },
              {
                title: 'API Integration Hub',
                subtitle: 'Third-Party Connectors',
                metrics: ['12 Services', '1.2K Events/day', '99.8% Success'],
                features: ['Webhook support', 'Auto-sync', 'Service integrations'],
              },
              {
                title: 'Maintenance Orders',
                subtitle: 'Operations Management',
                metrics: ['850 Orders/yr', '92% Completion', '3 Day Avg Response'],
                features: ['Priority routing', 'Contractor mgmt', 'Cost tracking'],
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
            <p className="text-slate-600">EstateFlow vs. Industry Leaders</p>
          </div>

          {/* Competitor Overview */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'EstateFlow', price: '£2-5K/mo', focus: 'UK Enterprise', highlight: true },
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
                powell: 'UK-first regulatory focus (MEES, Renting Homes Act, Companies House)',
                others: 'General-purpose with compliance bolt-ons',
              },
              {
                powell: 'Bulk document generation (1000+ documents)',
                others: 'Manual templates or third-party integrations',
              },
              {
                powell: 'Unified all-in-one platform',
                others: 'Modular add-ons increasing TCO',
              },
              {
                powell: 'Webhook & custom API framework',
                others: 'Limited API depth',
              },
              {
                powell: 'Full audit trail for every action',
                others: 'Basic compliance logging',
              },
              {
                powell: 'White-label tenant portal included',
                others: 'Tenant portal often separate cost',
              },
            ].map((diff, idx) => (
              <div key={idx} className="border-l-4 border-amber-600 bg-amber-50 p-4 rounded">
                <p className="text-sm">
                  <strong className="text-amber-900">EstateFlow:</strong> {diff.powell}
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
                <p className="font-bold text-slate-900">EstateFlow</p>
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
              <h4 className="font-bold text-green-900 mb-3">✓ Choose EstateFlow When:</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Large, complex multi-company portfolios (250+ units)</li>
                <li>✓ Full regulatory compliance required</li>
                <li>✓ Bulk document generation needed</li>
                <li>✓ Custom API integrations required</li>
                <li>✓ Unified all-in-one platform desired</li>
              </ul>
            </div>
            <div className="bg-slate-50 border-2 border-slate-400 rounded-lg p-6">
              <h4 className="font-bold text-slate-900 mb-3">Alternative Options:</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>🔵 <strong>Goodlord:</strong> Lettings agents, simple management</li>
                <li>🟣 <strong>AppFolio:</strong> Market leader, strong features</li>
                <li>🟠 <strong>Keogh:</strong> Budget-friendly, UK-focused</li>
                <li>🟢 <strong>Yardi:</strong> Enterprise mega-suites</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 text-white rounded-lg p-6 text-center text-sm">
            <p className="font-semibold mb-2">EstateFlow Platform</p>
            <p>Enterprise property management built for modern portfolio management</p>
            <p className="text-slate-400 mt-3">Marketing Collateral | March 2026</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t-2 border-blue-300 p-6 print:hidden">
        <div className="max-w-7xl mx-auto flex gap-3 justify-center">
          <Button
            onClick={printContent}
            variant="outline"
            className="gap-2"
          >
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