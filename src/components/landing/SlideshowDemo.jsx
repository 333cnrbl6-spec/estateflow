import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const SLIDES = [
  {
    title: 'Your entire portfolio at a glance',
    subtitle: 'The Premiso Dashboard',
    desc: 'A real-time overview of your properties, rent collection, compliance status and maintenance activity — all on one screen.',
    visual: 'dashboard',
    stats: [
      { label: 'Properties', value: '47' },
      { label: 'Units', value: '312' },
      { label: 'Occupancy', value: '96.8%' },
      { label: 'Rent Collected', value: '£112,400' },
    ],
    items: [
      { icon: '🔴', text: 'Gas cert expiring in 7 days — 14 Willow Drive' },
      { icon: '🟡', text: '3 maintenance requests awaiting assignment' },
      { icon: '🟢', text: '£18,400 rent collected this month' },
    ],
  },
  {
    title: 'Compliance that runs itself',
    subtitle: 'Compliance Hub',
    desc: 'Automatic expiry tracking for all your certificates. Get alerts weeks in advance. Never get caught out by a missed CP12 or EICR again.',
    visual: 'compliance',
    certs: [
      { name: 'Gas Safety (CP12)', property: '14 Willow Drive', expires: '7 days', status: 'warning' },
      { name: 'EICR Certificate', property: 'Flat 4, Reed Close', expires: '42 days', status: 'ok' },
      { name: 'Gas Safety (CP12)', property: '22 Oak Avenue', expires: 'EXPIRED', status: 'danger' },
      { name: 'EPC Certificate', property: 'Admiral Point #8', expires: '6 months', status: 'ok' },
    ],
  },
  {
    title: 'Maintenance from report to resolution',
    subtitle: 'Maintenance Workflow',
    desc: 'Tenants submit via their portal. Photos attach automatically. Job tickets go to contractors. You stay in control with a real-time Kanban board.',
    visual: 'maintenance',
    jobs: [
      { title: 'Boiler not working', tenant: 'Mr J. Smith', unit: 'Flat 3', status: 'reported', priority: 'urgent' },
      { title: 'Leaking kitchen tap', tenant: 'Ms A. Patel', unit: 'Flat 7', status: 'assigned', priority: 'standard' },
      { title: 'Broken window latch', tenant: 'Mrs T. Jones', unit: 'Flat 12', status: 'in_progress', priority: 'low' },
      { title: 'Mould in bathroom', tenant: 'Mr R. Khan', unit: 'Flat 1', status: 'completed', priority: 'standard' },
    ],
  },
  {
    title: 'Financials you can actually understand',
    subtitle: 'Financial Management',
    desc: 'Rent ledgers, service charges, invoicing and bank reconciliation — synced with Xero, Sage and QuickBooks. From arrears chasing to year-end reporting.',
    visual: 'financials',
    summary: [
      { month: 'Jan', collected: 108400, expected: 112000 },
      { month: 'Feb', collected: 110200, expected: 112000 },
      { month: 'Mar', collected: 112000, expected: 112000 },
      { month: 'Apr', collected: 89600, expected: 112000 },
    ],
  },
  {
    title: 'Tenant & landlord portals included',
    subtitle: 'Self-Service Portals',
    desc: 'Tenants can view their lease, pay rent, submit maintenance and access documents. Landlords see live portfolio statements. No more email back-and-forth.',
    visual: 'portals',
    features: [
      { icon: '📱', title: 'Tenant Portal', items: ['Pay rent online', 'Submit maintenance', 'View documents', 'Chat with PM'] },
      { icon: '📊', title: 'Landlord Portal', items: ['Live statements', 'Portfolio overview', 'Document access', 'Tax summaries'] },
    ],
  },
];

const statusColor = {
  reported: 'bg-blue-100 text-blue-700',
  assigned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};
const certColor = {
  ok: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

export default function SlideshowDemo({ onGetStarted }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];

  const renderVisual = () => {
    switch (current.visual) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {current.stats.map(s => (
                <div key={s.label} className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {current.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-3 border text-sm">
                  <span>{item.icon}</span>
                  <span className="text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-2">
            {current.certs.map((cert, i) => (
              <div key={i} className="flex items-center justify-between bg-white border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{cert.name}</p>
                  <p className="text-xs text-slate-500">{cert.property}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${certColor[cert.status]}`}>
                  {cert.expires}
                </span>
              </div>
            ))}
          </div>
        );

      case 'maintenance':
        return (
          <div className="grid grid-cols-2 gap-3">
            {current.jobs.map((job, i) => (
              <div key={i} className="bg-white border rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-slate-800 leading-tight">{job.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[job.status]}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{job.tenant} · {job.unit}</p>
              </div>
            ))}
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-3">
            {current.summary.map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 w-8">{row.month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(row.collected / row.expected) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-700">
                  £{(row.collected / 1000).toFixed(0)}k / £{(row.expected / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        );

      case 'portals':
        return (
          <div className="grid grid-cols-2 gap-4">
            {current.features.map(p => (
              <div key={p.title} className="bg-white border rounded-xl p-4">
                <div className="text-2xl mb-2">{p.icon}</div>
                <h4 className="font-semibold text-slate-800 mb-2">{p.title}</h4>
                <ul className="space-y-1">
                  {p.items.map(item => (
                    <li key={item} className="text-xs text-slate-500 flex gap-2">
                      <span className="text-green-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-sm text-slate-400">Step {slide + 1} of {SLIDES.length}</span>
        <div className="flex justify-center gap-2 mt-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === slide ? 'bg-primary w-8' : 'bg-slate-200 w-2'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{current.subtitle}</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">{current.title}</h3>
          <p className="text-slate-500 leading-relaxed mb-6">{current.desc}</p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSlide(Math.max(0, slide - 1))}
              disabled={slide === 0}
            >
              ← Back
            </Button>
            {slide < SLIDES.length - 1 ? (
              <Button onClick={() => setSlide(slide + 1)}>
                Next →
              </Button>
            ) : (
              <Button onClick={onGetStarted} className="bg-amber-500 hover:bg-amber-400 text-white">
                Get Started Free →
              </Button>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border">
          {renderVisual()}
        </div>
      </div>
    </div>
  );
}