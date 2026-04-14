import React from 'react';

const FEATURES = [
  {
    icon: '🏢',
    title: 'Full Portfolio Management',
    desc: 'Manage properties, units, tenants and landlords across your entire book. Multi-company, multi-region, one dashboard.',
    highlights: ['Properties & units', 'Tenant & landlord records', 'Block management', 'RTM companies'],
  },
  {
    icon: '💷',
    title: 'Financial Management',
    desc: 'Rent ledgers, service charges, ground rent, invoicing and bank reconciliation — with Xero, Sage and QuickBooks integration.',
    highlights: ['Rent tracking & arrears', 'Service charge budgets', 'Bank reconciliation', 'Accounting sync'],
  },
  {
    icon: '🔧',
    title: 'Maintenance & Contractors',
    desc: 'Raise, assign and track maintenance jobs from tenant report through to completion with photo evidence.',
    highlights: ['Tenant self-service portal', 'Contractor job tickets', 'Quote comparison', 'Photo documentation'],
  },
  {
    icon: '✅',
    title: 'Compliance Hub',
    desc: 'Never miss a gas cert, EICR or EPC again. Automated expiry alerts and renewal workflows for every certificate type.',
    highlights: ['Gas Safety (CP12)', 'EICR certificates', 'Deposit protection', 'Right to Rent'],
  },
  {
    icon: '📄',
    title: 'Document Automation',
    desc: 'Generate tenancy agreements, Section 21s, notices and letters from smart templates — pre-populated from your data.',
    highlights: ['Legal document templates', 'e-Signature ready', 'Document repository', 'Auto-population'],
  },
  {
    icon: '📊',
    title: 'Reporting & Analytics',
    desc: 'Landlord statements, financial reports, KPI dashboards and performance analytics built in — no spreadsheets needed.',
    highlights: ['Landlord monthly reports', 'Portfolio KPIs', 'Cash flow statements', 'Maintenance analytics'],
  },
  {
    icon: '🏪',
    title: 'Sales CRM',
    desc: 'Manage sales listings, buyer portals, offers, viewings and agent performance all in the same platform.',
    highlights: ['Property listings', 'Buyer portal', 'Viewing management', 'Agent leaderboards'],
  },
  {
    icon: '📞',
    title: 'Out-of-Hours Service',
    desc: 'Built-in out-of-hours emergency call handling with escalation workflows and contractor dispatch — no third party needed.',
    highlights: ['24/7 call handling', 'Emergency escalation', 'Contractor dispatch', 'Audit trail'],
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Premiso replaces 6–8 separate tools with one integrated platform built
            specifically for UK property professionals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
            >
              <div className="text-3xl mb-4">{feat.icon}</div>
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-primary transition">{feat.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{feat.desc}</p>
              <ul className="space-y-1">
                {feat.highlights.map(h => (
                  <li key={h} className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}