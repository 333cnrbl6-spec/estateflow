import React, { useState } from 'react';

const USER_SCENARIOS = [
  {
    id: 'property_manager',
    emoji: '🏠',
    label: 'Property Manager',
    desc: 'Manage lettings, maintenance, compliance and financials for a portfolio of residential properties.',
    path: '/dashboard',
  },
  {
    id: 'block_manager',
    emoji: '🏢',
    label: 'Block / Leasehold Manager',
    desc: 'Service charges, RTM, building safety, leaseholder communications and compliance certificates.',
    path: '/block-management',
  },
  {
    id: 'sales_agent',
    emoji: '🤝',
    label: 'Sales Agent',
    desc: 'Manage listings, leads, viewings, offers and buyer communications in one place.',
    path: '/sales',
  },
  {
    id: 'tenant',
    emoji: '🛋️',
    label: 'Tenant',
    desc: 'Pay rent, raise maintenance requests, view documents and communicate with your letting agent.',
    path: '/tenant-self-service',
  },
  {
    id: 'contractor',
    emoji: '🔧',
    label: 'Contractor',
    desc: 'View assigned jobs, submit quotes, upload photos and submit invoices from the field.',
    path: '/contractor',
  },
  {
    id: 'landlord',
    emoji: '📋',
    label: 'Landlord / Owner',
    desc: 'See your income, expenses, compliance status and monthly statements across your portfolio.',
    path: '/owner-financials',
  },
];

export default function DemoChooser({ onChoose, chosen }) {
  const [showScenarios, setShowScenarios] = useState(chosen === 'scenario');

  const handleScenarioClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6 text-left">
        {/* Option 1: Slideshow */}
        <button
          onClick={() => { setShowScenarios(false); onChoose('slideshow'); }}
          className={`p-8 rounded-2xl border-2 transition-all text-left group ${
            chosen === 'slideshow'
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-md'
          }`}
        >
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Slideshow Tour</h3>
          <p className="text-slate-500 text-sm mb-4">
            See a guided walkthrough of Premiso's key features using realistic sample data. About 3 minutes.
          </p>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>✓ Instant — no setup</li>
            <li>✓ Pre-built realistic data</li>
            <li>✓ Key features highlighted</li>
          </ul>
          {chosen === 'slideshow' && (
            <div className="mt-4 text-primary font-medium text-sm">✓ Selected — scroll down to start</div>
          )}
        </button>

        {/* Option 2: Personalised wizard */}
        <button
          onClick={() => { setShowScenarios(false); onChoose('personalised'); }}
          className={`p-8 rounded-2xl border-2 transition-all text-left group ${
            chosen === 'personalised'
              ? 'border-amber-400 bg-amber-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-amber-400/50 hover:shadow-md'
          }`}
        >
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Build Your Own Demo</h3>
          <p className="text-slate-500 text-sm mb-4">
            Enter your company details and see Premiso set up exactly for your business.
          </p>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>✓ Your real company name & branding</li>
            <li>✓ Companies House integration</li>
            <li>✓ Personalised property data</li>
          </ul>
          {chosen === 'personalised' && (
            <div className="mt-4 text-amber-600 font-medium text-sm">✓ Selected — scroll down to begin</div>
          )}
        </button>

        {/* Option 3: Human scenario chooser */}
        <button
          onClick={() => { setShowScenarios(true); onChoose('scenario'); }}
          className={`p-8 rounded-2xl border-2 transition-all text-left group ${
            chosen === 'scenario'
              ? 'border-emerald-400 bg-emerald-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-emerald-400/50 hover:shadow-md'
          }`}
        >
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Explore as a User</h3>
          <p className="text-slate-500 text-sm mb-4">
            Jump straight into the platform as a specific person — property manager, tenant, contractor or landlord.
          </p>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>✓ Live platform — real screens</li>
            <li>✓ Six role scenarios</li>
            <li>✓ No account needed</li>
          </ul>
          {chosen === 'scenario' && (
            <div className="mt-4 text-emerald-600 font-medium text-sm">✓ Choose your role below</div>
          )}
        </button>
      </div>

      {/* Scenario picker — shown when "Explore as a User" is selected */}
      {showScenarios && (
        <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-1">Who are you today?</h4>
          <p className="text-sm text-slate-500 mb-5">Pick a role and jump straight into that view of Premiso.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {USER_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioClick(s.path)}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
              >
                <span className="text-2xl mt-0.5">{s.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 text-sm">{s.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}