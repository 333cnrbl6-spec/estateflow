import React from 'react';

export default function DemoChooser({ onChoose, chosen }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 text-left">
      <button
        onClick={() => onChoose('slideshow')}
        className={`p-8 rounded-2xl border-2 transition-all text-left group ${
          chosen === 'slideshow'
            ? 'border-primary bg-primary/5 shadow-lg'
            : 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-md'
        }`}
      >
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Slideshow Tour</h3>
        <p className="text-slate-500 text-sm mb-4">
          See a guided walkthrough of Premiso's key features using realistic sample data.
          Takes about 3 minutes — no sign-up required.
        </p>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>✓ Instant — no setup</li>
          <li>✓ Pre-built realistic data</li>
          <li>✓ Key features highlighted</li>
          <li>✓ Perfect for a quick overview</li>
        </ul>
        {chosen === 'slideshow' && (
          <div className="mt-4 text-primary font-medium text-sm">✓ Selected — scroll down to start</div>
        )}
      </button>

      <button
        onClick={() => onChoose('personalised')}
        className={`p-8 rounded-2xl border-2 transition-all text-left group ${
          chosen === 'personalised'
            ? 'border-amber-400 bg-amber-50 shadow-lg'
            : 'border-slate-200 bg-white hover:border-amber-400/50 hover:shadow-md'
        }`}
      >
        <div className="text-4xl mb-4">🏢</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Build Your Own Demo</h3>
        <p className="text-slate-500 text-sm mb-4">
          Enter your company details, connect to Companies House, choose your directors
          and property portfolio — and see Premiso set up exactly for your business.
        </p>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>✓ Your real company name & branding</li>
          <li>✓ Companies House integration</li>
          <li>✓ Personalised property data</li>
          <li>✓ Share your demo link with colleagues</li>
        </ul>
        {chosen === 'personalised' && (
          <div className="mt-4 text-amber-600 font-medium text-sm">✓ Selected — scroll down to begin</div>
        )}
      </button>
    </div>
  );
}