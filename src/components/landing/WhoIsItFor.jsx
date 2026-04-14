/**
 * WhoIsItFor
 * Full-spectrum audience section — covers every user type in the built environment,
 * ordered from mass-market (individual landlords) through to enterprise (large agents/freeholders).
 */
import React, { useState } from 'react';

const SEGMENTS = [
  {
    emoji: '🏠',
    title: 'Buy-to-Let Landlords',
    subtitle: 'Small portfolios, big peace of mind',
    desc: 'Whether you own one flat or a handful of properties, Premiso gives you a professional landlord platform — rent tracking, compliance certificates, tenant comms and maintenance in one place. No more spreadsheets, no more missed renewals.',
    highlights: ['Rent ledger & arrears alerts', 'Gas, EICR & EPC tracking', 'Tenant portal', 'Monthly landlord statements'],
    colour: 'border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-50 text-blue-700',
  },
  {
    emoji: '🏘️',
    title: 'Property Owners & Investors',
    subtitle: 'Manage your asset, not your inbox',
    desc: 'HNW investors and multi-property owners get real-time visibility of portfolio performance, yield analytics, void tracking and consolidated financial reporting — whether you self-manage or work through an agent.',
    highlights: ['Portfolio yield dashboards', 'Multi-property financials', 'Void tracking', 'Owner financial portal'],
    colour: 'border-indigo-200 hover:border-indigo-400',
    badge: 'bg-indigo-50 text-indigo-700',
  },
  {
    emoji: '🏢',
    title: 'Letting Agents',
    subtitle: 'From 50 to 5,000 managed units',
    desc: 'Run your lettings book end-to-end — tenancy pipeline, rent collection, arrears chasing, contractor management, compliance certificates and landlord reporting. Connects to Xero, Sage and QuickBooks. Replaces Reapit, Jupix and the rest.',
    highlights: ['Full tenancy lifecycle', 'Rent & arrears management', 'Contractor & maintenance', 'Accounting sync'],
    colour: 'border-primary/40 hover:border-primary',
    badge: 'bg-primary/10 text-primary',
    featured: true,
  },
  {
    emoji: '🏛️',
    title: 'Freeholders & Block Owners',
    subtitle: 'Own the freehold, own the data',
    desc: 'Freeholders managing their own blocks get service charge budgeting, ground rent collection, leaseholder communications and building safety compliance — without paying a managing agent markup.',
    highlights: ['Service charge accounts', 'Ground rent management', 'Section 20 consultations', 'Building safety register'],
    colour: 'border-amber-200 hover:border-amber-400',
    badge: 'bg-amber-50 text-amber-700',
  },
  {
    emoji: '🔑',
    title: 'Block Management Companies',
    subtitle: 'Professional block management at scale',
    desc: 'Managing agents running leasehold blocks get a purpose-built block management suite — service charge accounting, major works, leaseholder portals, building safety compliance and RTM company administration, all under one roof.',
    highlights: ['Service charge & budgets', 'Major works (S.20)', 'Leaseholder portal', 'RTM administration'],
    colour: 'border-slate-300 hover:border-slate-500',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    emoji: '🌐',
    title: 'Large Property Management Groups',
    subtitle: 'Multi-branch, multi-company, one system',
    desc: 'Group operators managing thousands of units across multiple offices get multi-company architecture, consolidated reporting, white-label branding, custom integrations and a dedicated account team — without the enterprise price tag.',
    highlights: ['Multi-company & multi-branch', 'Consolidated group reporting', 'White-label & API access', 'SLA-backed support'],
    colour: 'border-emerald-200 hover:border-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  {
    emoji: '🤝',
    title: 'Sales & Estate Agents',
    subtitle: 'From valuation to completion',
    desc: 'Run your sales operation alongside your lettings book. Listings, buyer portals, viewing management, offer tracking, agent leaderboards and market reports — all joined up with your property and tenant data.',
    highlights: ['Sales CRM & pipeline', 'Buyer portal & offers', 'Viewing scheduling', 'Agent performance analytics'],
    colour: 'border-rose-200 hover:border-rose-400',
    badge: 'bg-rose-50 text-rose-700',
  },
  {
    emoji: '🔧',
    title: 'Contractors & Tradespeople',
    subtitle: 'Jobs, quotes and invoices — from the field',
    desc: 'Contractors working for Premiso-managed properties get a dedicated mobile portal — see assigned jobs, upload photos, submit quotes and invoices, and track payment. No admin, no chasing.',
    highlights: ['Mobile job portal', 'Quote submission', 'Photo & invoice upload', 'Payment tracking'],
    colour: 'border-orange-200 hover:border-orange-400',
    badge: 'bg-orange-50 text-orange-700',
  },
];

export default function WhoIsItFor({ onGetStarted }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section id="who-is-it-for" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Built for the whole industry</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Who uses Premiso?
          </h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto">
            From individual buy-to-let landlords to large property management groups — Premiso scales
            across every part of the built environment. One platform, every role.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEGMENTS.map((seg, i) => (
            <button
              key={seg.title}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className={`text-left border-2 rounded-2xl p-6 transition-all duration-200 bg-white ${seg.colour} ${
                seg.featured ? 'ring-2 ring-primary/20 shadow-lg' : ''
              } ${expanded === i ? 'shadow-xl scale-[1.02]' : 'hover:shadow-md'}`}
            >
              <div className="text-3xl mb-3">{seg.emoji}</div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-3 ${seg.badge}`}>
                {seg.subtitle}
              </div>
              <h3 className={`font-bold text-slate-900 mb-2 ${seg.featured ? 'text-primary' : ''}`}>
                {seg.title}
                {seg.featured && <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded font-semibold">★ Popular</span>}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {expanded === i ? seg.desc : seg.desc.slice(0, 90) + '…'}
              </p>

              {expanded === i && (
                <ul className="mt-4 space-y-1.5 border-t pt-4">
                  {seg.highlights.map(h => (
                    <li key={h} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-primary font-medium mt-3">
                {expanded === i ? '↑ Show less' : 'Read more →'}
              </p>
            </button>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-14 bg-primary rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Whatever your role, there's a Premiso plan for you</h3>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            30-day free trial on every plan. No credit card required. Setup in under 10 minutes.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-xl text-lg transition"
          >
            Start Free Trial →
          </button>
        </div>
      </div>
    </section>
  );
}