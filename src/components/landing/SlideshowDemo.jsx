import React, { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    id: 'dashboard',
    subtitle: 'Executive Dashboard',
    title: 'Your entire portfolio — at a glance',
    desc: 'A real-time command centre showing rent collection, compliance status, maintenance activity and occupancy across every property you manage. No spreadsheets. No chasing.',
    badge: '🏢 Portfolio Overview',
    stats: [
      { label: 'Properties', value: '47', trend: '+3 this month', up: true },
      { label: 'Units', value: '312', trend: '96.8% occupied', up: true },
      { label: 'Rent Collected', value: '£112k', trend: '98.2% collection rate', up: true },
      { label: 'Open Issues', value: '7', trend: '↓ 4 resolved today', up: false },
    ],
    alerts: [
      { type: 'danger', icon: '🔴', text: 'Gas cert EXPIRED — 22 Oak Avenue', action: 'Book engineer' },
      { type: 'warning', icon: '🟡', text: 'CP12 expiring in 7 days — 14 Willow Drive', action: 'Schedule now' },
      { type: 'info', icon: '🔵', text: '3 maintenance jobs awaiting contractor', action: 'Assign' },
      { type: 'success', icon: '🟢', text: '£18,400 rent collected today', action: 'View ledger' },
    ],
  },
  {
    id: 'compliance',
    subtitle: 'Compliance Hub',
    title: 'Never miss a certificate again',
    desc: 'Premiso tracks every Gas Safety, EICR, EPC, Fire Risk Assessment and Legionella certificate across your portfolio. Automatic reminders. Instant alerts. Full audit trail.',
    badge: '🛡️ Compliance Tracking',
    certs: [
      { name: 'Gas Safety (CP12)', property: '22 Oak Avenue', unit: 'Whole property', expires: 'EXPIRED', status: 'danger', days: null },
      { name: 'Gas Safety (CP12)', property: '14 Willow Drive', unit: 'Flat 3', expires: '7 days', status: 'warning', days: 7 },
      { name: 'EICR Certificate', property: 'Admiral Point', unit: 'Flat 4', expires: '42 days', status: 'ok', days: 42 },
      { name: 'EPC Certificate', property: 'Reed Close', unit: 'Flat 8', expires: '6 months', status: 'ok', days: 180 },
      { name: 'Fire Risk Assessment', property: 'Maple Court', unit: 'Block A', expires: '11 months', status: 'ok', days: 330 },
    ],
    summary: { total: 94, compliant: 88, warning: 4, expired: 2 },
  },
  {
    id: 'maintenance',
    subtitle: 'Maintenance Workflow',
    title: 'From tenant report to job complete',
    desc: 'Tenants submit via their portal. Photos attach automatically. Contractors receive job packs instantly. You track progress on a real-time Kanban board — from first report to invoice approval.',
    badge: '🔧 Live Job Board',
    columns: [
      {
        label: 'Reported', color: 'blue',
        jobs: [
          { title: 'Boiler not working', tenant: 'Mr J. Smith', unit: 'Flat 3', priority: 'emergency', time: '2h ago' },
          { title: 'Front door lock stiff', tenant: 'Ms A. Patel', unit: 'Flat 9', priority: 'standard', time: '1d ago' },
        ],
      },
      {
        label: 'Assigned', color: 'purple',
        jobs: [
          { title: 'Leaking kitchen tap', tenant: 'Mrs T. Jones', unit: 'Flat 7', priority: 'urgent', time: 'Plumber: 3pm today' },
        ],
      },
      {
        label: 'In Progress', color: 'orange',
        jobs: [
          { title: 'Mould in bathroom', tenant: 'Mr R. Khan', unit: 'Flat 1', priority: 'standard', time: 'On site now' },
          { title: 'Broken window latch', tenant: 'Ms C. Lee', unit: 'Flat 12', priority: 'low', time: 'Started 10am' },
        ],
      },
      {
        label: 'Completed', color: 'green',
        jobs: [
          { title: 'Thermostat replaced', tenant: 'Mr O. Brown', unit: 'Flat 5', priority: 'standard', time: 'Done · £240' },
        ],
      },
    ],
  },
  {
    id: 'financials',
    subtitle: 'Financial Management',
    title: 'Financials you can actually understand',
    desc: 'Rent ledgers, service charges, invoicing and bank reconciliation — all in one place. Syncs with Xero, Sage and QuickBooks. Chase arrears automatically. Generate landlord statements in one click.',
    badge: '💰 Financial Dashboard',
    months: [
      { month: 'Nov', collected: 109200, expected: 112000, arrears: 1 },
      { month: 'Dec', collected: 110500, expected: 112000, arrears: 1 },
      { month: 'Jan', collected: 108400, expected: 112000, arrears: 2 },
      { month: 'Feb', collected: 111800, expected: 112000, arrears: 0 },
      { month: 'Mar', collected: 112000, expected: 112000, arrears: 0 },
      { month: 'Apr', collected: 94400, expected: 112000, arrears: 3 },
    ],
    breakdown: [
      { label: 'Rent Received', value: '£94,400', note: 'Month to date' },
      { label: 'Service Charges', value: '£12,800', note: 'All collected' },
      { label: 'Arrears', value: '£17,600', note: '3 tenants', alert: true },
      { label: 'Ground Rent', value: '£4,200', note: 'Quarterly due' },
    ],
  },
  {
    id: 'portals',
    subtitle: 'Self-Service Portals',
    title: 'Portals for tenants and landlords',
    desc: 'Tenants pay rent, raise jobs and access documents 24/7. Landlords view live statements and portfolio performance. Cut your inbound queries by up to 70%.',
    badge: '📱 Tenant & Landlord Portals',
    tenant: {
      name: 'Sarah Johnson',
      unit: 'Flat 7, Admiral Point',
      rent: '£1,150/mo',
      nextDue: '1st May 2026',
      status: 'Up to date',
      actions: ['Pay Rent Online', 'Report a Problem', 'View Documents', 'Message Manager'],
      notifications: ['Your maintenance request has been assigned to a plumber', 'Rent reminder: £1,150 due in 5 days'],
    },
    landlord: {
      name: 'David Chen',
      portfolio: '12 units across 4 properties',
      yield: '6.4%',
      income: '£11,200/mo',
      actions: ['Download Statement', 'View All Properties', 'Approve Invoice', 'Tax Summary'],
    },
  },
  {
    id: 'reporting',
    subtitle: 'Reporting & Insights',
    title: 'Reports that impress your clients',
    desc: "Monthly landlord statements, arrears summaries, maintenance cost breakdowns and compliance audits — all branded with your agency's logo. Delivered automatically. No manual work.",
    badge: '📊 Automated Reporting',
    reports: [
      { name: 'Monthly Landlord Statement', desc: 'Income, expenses, net return per property', icon: '📄', time: 'Auto-sent 1st of month', popular: true },
      { name: 'Compliance Audit Report', desc: 'Certificate status across all properties', icon: '🛡️', time: 'Weekly digest', popular: false },
      { name: 'Arrears & Collections Report', desc: 'Outstanding rent with chase history', icon: '💸', time: 'Real-time', popular: false },
      { name: 'Maintenance Cost Analysis', desc: 'Spend by property, contractor and category', icon: '🔧', time: 'Monthly', popular: true },
      { name: 'Portfolio Performance', desc: 'Occupancy, yield, void periods, trends', icon: '📈', time: 'Quarterly', popular: false },
    ],
  },
  {
    id: 'getstarted',
    subtitle: 'Get Started',
    title: 'Built for letting agents and block managers',
    desc: "Whether you manage 50 units or 5,000, Premiso scales with you. Full onboarding support. Live from day one. No long contracts.",
    badge: '🚀 Ready to Go',
    pricing: [
      { tier: 'Starter', price: '£99', units: 'Up to 50 units', features: ['Properties & unit management', 'Tenant & landlord portal', 'Maintenance workflow', 'Basic compliance certificates'] },
      { tier: 'Professional', price: '£249', units: 'Up to 250 units', features: ['Everything in Starter', 'Block & leasehold management', 'Accounting sync (Xero/Sage/QB)', 'Full compliance hub', 'Sales CRM'], highlight: true },
      { tier: 'Enterprise', price: 'Custom', units: 'Unlimited units', features: ['Everything in Professional', 'White-label & custom branding', 'Dedicated onboarding', 'SLA guarantee'] },
    ],
  },
];

const SLIDE_DURATION = 7000; // 7 seconds per slide

const priorityColor = {
  emergency: 'bg-red-100 text-red-700',
  urgent: 'bg-orange-100 text-orange-700',
  standard: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
};
const colColor = {
  blue: 'border-blue-300 bg-blue-50',
  purple: 'border-purple-300 bg-purple-50',
  orange: 'border-orange-300 bg-orange-50',
  green: 'border-green-300 bg-green-50',
};
const colHeaderColor = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  green: 'bg-green-500',
};
const certStatusColor = {
  ok: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
};
const alertBg = {
  danger: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
};

function VisualDashboard({ slide }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {slide.stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs font-medium text-slate-600">{s.label}</p>
            <p className={`text-xs mt-1 ${s.up ? 'text-green-600' : 'text-orange-500'}`}>{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {slide.alerts.map((a, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border text-sm ${alertBg[a.type]}`}>
            <div className="flex items-center gap-2">
              <span>{a.icon}</span>
              <span className="text-slate-700 font-medium">{a.text}</span>
            </div>
            <span className="text-xs text-primary font-semibold whitespace-nowrap ml-2 cursor-pointer hover:underline">{a.action} →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualCompliance({ slide }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Total', value: slide.summary.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'Compliant', value: slide.summary.compliant, color: 'bg-green-100 text-green-700' },
          { label: 'Warning', value: slide.summary.warning, color: 'bg-amber-100 text-amber-700' },
          { label: 'Expired', value: slide.summary.expired, color: 'bg-red-100 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs">{s.label}</p>
          </div>
        ))}
      </div>
      {slide.certs.map((c, i) => (
        <div key={i} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
            <p className="text-xs text-slate-500">{c.property} · {c.unit}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold border whitespace-nowrap ${certStatusColor[c.status]}`}>
            {c.expires}
          </span>
        </div>
      ))}
    </div>
  );
}

function VisualMaintenance({ slide }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {slide.columns.map(col => (
        <div key={col.label} className={`rounded-xl border-2 p-2 ${colColor[col.color]}`}>
          <div className={`text-white text-xs font-bold rounded px-2 py-1 mb-2 inline-block ${colHeaderColor[col.color]}`}>
            {col.label} ({col.jobs.length})
          </div>
          <div className="space-y-2">
            {col.jobs.map((job, i) => (
              <div key={i} className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-800 leading-tight mb-1">{job.title}</p>
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColor[job.priority]}`}>
                    {job.priority}
                  </span>
                  <span className="text-xs text-slate-400">{job.unit}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{job.time}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VisualFinancials({ slide }) {
  const max = Math.max(...slide.months.map(m => m.expected));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 mb-2">
        {slide.breakdown.map(b => (
          <div key={b.label} className={`rounded-lg p-3 border ${b.alert ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
            <p className="text-xs text-slate-500">{b.label}</p>
            <p className={`text-lg font-bold ${b.alert ? 'text-red-600' : 'text-slate-900'}`}>{b.value}</p>
            <p className={`text-xs ${b.alert ? 'text-red-500' : 'text-slate-400'}`}>{b.note}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2">Rent Collection — Last 6 Months</p>
        <div className="flex items-end gap-2 h-20">
          {slide.months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end h-14">
                <div
                  className="w-full rounded-t-sm bg-slate-200"
                  style={{ height: `${(m.expected / max) * 100}%` }}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${m.collected >= m.expected ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ height: `${(m.collected / m.expected) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualPortals({ slide }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Tenant */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {slide.tenant.name[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{slide.tenant.name}</p>
            <p className="text-xs text-slate-500">{slide.tenant.unit}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 flex justify-between items-center">
          <span className="text-xs text-green-700 font-medium">Rent Status</span>
          <span className="text-xs font-bold text-green-700">{slide.tenant.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {slide.tenant.actions.map(a => (
            <button key={a} className="text-xs bg-slate-100 text-slate-700 rounded px-2 py-1.5 font-medium hover:bg-slate-200 text-center">{a}</button>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded p-2">
          <p className="text-xs text-blue-700 font-medium mb-1">🔔 Latest</p>
          <p className="text-xs text-blue-600">{slide.tenant.notifications[0]}</p>
        </div>
      </div>
      {/* Landlord */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
            {slide.landlord.name[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{slide.landlord.name}</p>
            <p className="text-xs text-slate-500">{slide.landlord.portfolio}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-slate-50 rounded-lg p-2 text-center border">
            <p className="text-sm font-bold text-slate-900">{slide.landlord.yield}</p>
            <p className="text-xs text-slate-500">Avg Yield</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center border">
            <p className="text-sm font-bold text-slate-900">{slide.landlord.income}</p>
            <p className="text-xs text-slate-500">Monthly</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {slide.landlord.actions.map(a => (
            <button key={a} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded px-2 py-1.5 font-medium text-center hover:bg-amber-100">{a}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualReporting({ slide }) {
  return (
    <div className="space-y-2">
      {slide.reports.map((r, i) => (
        <div key={i} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${r.popular ? 'bg-primary/5 border-primary/20' : 'bg-white border-slate-200'}`}>
          <span className="text-xl">{r.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-800">{r.name}</p>
              {r.popular && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded font-medium">Popular</span>}
            </div>
            <p className="text-xs text-slate-500">{r.desc}</p>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{r.time}</span>
        </div>
      ))}
    </div>
  );
}

function VisualGetStarted({ slide, onGetStarted }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slide.pricing.map((p, i) => (
        <div key={i} className={`rounded-xl border p-3 flex flex-col ${p.highlight ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-200 bg-white'}`}>
          {p.highlight && <span className="text-xs font-bold text-primary mb-1">Most Popular</span>}
          <p className="text-sm font-bold text-slate-900">{p.tier}</p>
          <p className="text-xl font-extrabold text-slate-900 my-1">{p.price}<span className="text-xs font-normal text-slate-500">/mo</span></p>
          <p className="text-xs text-slate-500 mb-2">{p.units}</p>
          <ul className="space-y-1 flex-1">
            {p.features.map(f => (
              <li key={f} className="text-xs text-slate-600 flex gap-1"><span className="text-green-500 font-bold">✓</span>{f}</li>
            ))}
          </ul>
          <button
            onClick={onGetStarted}
            className={`mt-3 w-full text-xs font-bold py-2 rounded-lg transition ${p.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
          >
            Get Started
          </button>
        </div>
      ))}
    </div>
  );
}

export default function SlideshowDemo({ onGetStarted }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1); // 1=forward -1=back

  const goTo = useCallback((idx, dir = 1) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setSlide(idx);
      setProgress(0);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const goNext = useCallback(() => {
    if (slide < SLIDES.length - 1) goTo(slide + 1, 1);
    else goTo(0, 1);
  }, [slide, goTo]);

  const goPrev = useCallback(() => {
    if (slide > 0) goTo(slide - 1, -1);
  }, [slide, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + (100 / (SLIDE_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, goNext]);

  const current = SLIDES[slide];

  const renderVisual = () => {
    switch (current.id) {
      case 'dashboard': return <VisualDashboard slide={current} />;
      case 'compliance': return <VisualCompliance slide={current} />;
      case 'maintenance': return <VisualMaintenance slide={current} />;
      case 'financials': return <VisualFinancials slide={current} />;
      case 'portals': return <VisualPortals slide={current} />;
      case 'reporting': return <VisualReporting slide={current} />;
      case 'getstarted': return <VisualGetStarted slide={current} onGetStarted={onGetStarted} />;
      default: return null;
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div className="flex gap-1 mb-5">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => { setPaused(false); goTo(i, i > slide ? 1 : -1); }}
            className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden"
            title={s.subtitle}
          >
            <div
              className="h-full bg-primary rounded-full transition-none"
              style={{
                width: i < slide ? '100%' : i === slide ? `${progress}%` : '0%',
                transition: i === slide ? 'width 0.1s linear' : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* Slide */}
      <div
        className="transition-all duration-300"
        style={{ opacity: animating ? 0 : 1, transform: animating ? `translateX(${direction * -24}px)` : 'translateX(0)' }}
      >
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: text */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              {current.badge}
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-snug">{current.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm lg:text-base">{current.desc}</p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={goPrev}
                disabled={slide === 0}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Back
              </button>
              {slide < SLIDES.length - 1 ? (
                <button
                  onClick={goNext}
                  className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="px-6 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition"
                >
                  Get Started Free →
                </button>
              )}
              <button
                onClick={() => setPaused(p => !p)}
                className="ml-auto px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50 transition"
              >
                {paused ? '▶ Play' : '⏸ Pause'}
              </button>
            </div>

            {/* Slide counter */}
            <p className="text-xs text-slate-400 mt-4">{slide + 1} / {SLIDES.length} — hover to pause</p>
          </div>

          {/* Right: visual */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm min-h-[280px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded text-xs text-slate-400 px-2 py-0.5">
                premiso.co.uk/{current.id}
              </div>
            </div>
            {renderVisual()}
          </div>
        </div>
      </div>
    </div>
  );
}