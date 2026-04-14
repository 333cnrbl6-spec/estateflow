import React, { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    id: 'portfolio',
    subtitle: 'Portfolio Management',
    title: 'Manage your entire portfolio from one dashboard',
    desc: 'Real-time view of all your properties, units, rent collection, compliance status, and maintenance activity. Track occupancy, arrears, and KPIs across your portfolio instantly.',
    badge: '🏢 Portfolio Management',
    audience: 'Letting Agents · Property Managers',
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
    id: 'financials',
    subtitle: 'Financial Management',
    title: 'Track rent, arrears, and profitability',
    desc: 'Real-time rent collection tracking, arrears management, expense breakdown, and financial reports. See exactly what you're earning on each property and where your money goes.',
    badge: '💰 Financial Dashboard',
    audience: 'Property Owners · Investors · Letting Agents',
    breakdown: [
      { label: 'Rent Received', value: '£94,400', note: 'Month to date' },
      { label: 'Service Charges', value: '£12,800', note: 'All collected' },
      { label: 'Arrears', value: '£17,600', note: '3 tenants', alert: true },
      { label: 'Ground Rent', value: '£4,200', note: 'Quarterly due' },
    ],
    months: [
      { month: 'Nov', collected: 109200, expected: 112000 },
      { month: 'Dec', collected: 110500, expected: 112000 },
      { month: 'Jan', collected: 108400, expected: 112000 },
      { month: 'Feb', collected: 111800, expected: 112000 },
      { month: 'Mar', collected: 112000, expected: 112000 },
      { month: 'Apr', collected: 94400, expected: 112000 },
    ],
  },
  {
    id: 'btl',
    subtitle: 'Buy-to-Let Landlord',
    title: 'Manage your rental properties like a pro',
    desc: 'Track rent payments, tenancy dates, maintenance requests, and safety certificates for each property. Get monthly statements and know exactly what you're earning and owe.',
    badge: '🏠 Buy-to-Let',
    audience: 'Individual landlords · Small investors',
    properties: [
      { address: '14 Willow Drive, Flat 3', tenant: 'Mr J. Harrison', rent: '£1,250/mo', status: 'Paid', yield: '5.8%', cert: 'warning' },
      { address: '8 Maple Close', tenant: 'Ms A. Patel', rent: '£975/mo', status: 'Paid', yield: '5.1%', cert: 'ok' },
      { address: '22 Oak Avenue', tenant: 'Mrs T. Singh', rent: '£1,400/mo', status: 'Overdue', yield: '6.2%', cert: 'danger' },
    ],
    summary: { income: '£3,625', yield: '5.7%', arrears: '£1,400', certs: 1 },
  },
];

const SLIDE_DURATION = 8000;

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

// ── App Screenshot Mockups ────────────────────────────────────────────────────
// Realistic pixel-perfect mockups of actual Premiso screens embedded in browser chrome

function AppScreenshot({ title, url, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded text-xs text-slate-400 px-2 py-0.5 mx-2">
          premiso.co.uk/{url}
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// Sidebar + content layout mockup
function AppScreenshotWithSidebar({ url, activeNav, children }) {
  const navItems = [
    { icon: '📊', label: 'Dashboard' },
    { icon: '🏢', label: 'Properties' },
    { icon: '👥', label: 'Tenants' },
    { icon: '🔧', label: 'Maintenance' },
    { icon: '🛡️', label: 'Compliance' },
    { icon: '💰', label: 'Financials' },
    { icon: '📞', label: 'Out-of-Hours' },
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded text-xs text-slate-400 px-2 py-0.5 mx-1 truncate">
          premiso.co.uk/{url}
        </div>
      </div>
      <div className="flex" style={{ minHeight: 220 }}>
        {/* Sidebar */}
        <div className="w-28 shrink-0 border-r border-slate-200" style={{ background: 'hsl(221 55% 20%)' }}>
          <div className="px-2 py-2 border-b border-white/10">
            <div className="text-white text-xs font-bold">Premiso</div>
            <div className="text-white/40 text-xs">Property Mgmt</div>
          </div>
          <div className="py-1">
            {navItems.map((n, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded text-xs cursor-pointer ${
                n.label === activeNav ? 'bg-white/15 text-white font-semibold' : 'text-white/60 hover:text-white'
              }`}>
                <span className="text-xs">{n.icon}</span>
                <span className="text-xs">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 p-2.5 bg-slate-50 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

// ── Visuals ──────────────────────────────────────────────────────────────────

function VisualPortfolio({ slide }) {
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
              <span className="text-slate-700 font-medium text-xs">{a.text}</span>
            </div>
            <span className="text-xs text-primary font-semibold whitespace-nowrap ml-2">{a.action} →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualBTL({ slide }) {
  const statusColor = s => s === 'Paid' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 mb-1">
        {[
          { label: 'Monthly Income', value: slide.summary.income, color: 'bg-green-50 text-green-800' },
          { label: 'Avg Yield', value: slide.summary.yield, color: 'bg-blue-50 text-blue-800' },
          { label: 'Arrears', value: slide.summary.arrears, color: 'bg-red-50 text-red-700' },
          { label: 'Certs Due', value: `${slide.summary.certs} alert`, color: 'bg-amber-50 text-amber-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg p-2 text-center border ${s.color}`}>
            <p className="text-sm font-bold">{s.value}</p>
            <p className="text-xs opacity-70">{s.label}</p>
          </div>
        ))}
      </div>
      {slide.properties.map((p, i) => (
        <div key={i} className="bg-white border rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{p.address}</p>
            <p className="text-xs text-slate-500">{p.tenant} · {p.rent}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>{p.status}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${certStatusColor[p.cert]}`}>cert</span>
            <span className="text-xs text-slate-500">{p.yield}</span>
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
                <div className="w-full rounded-t-sm bg-slate-200" style={{ height: `${(m.expected / max) * 100}%` }}>
                  <div className={`w-full rounded-t-sm ${m.collected >= m.expected ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ height: `${(m.collected / m.expected) * 100}%` }} />
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

// ── App Screenshot Screen Components ─────────────────────────────────────────

function ScreenPortfolio({ slide }) {
  return (
    <AppScreenshotWithSidebar url="portfolio" activeNav="Dashboard">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-bold text-slate-800">Executive Dashboard</p>
            <p className="text-xs text-slate-400">Admiral Group · 47 properties · 312 units</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Live</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {slide.stats.map(s => (
            <div key={s.label} className="bg-white rounded-lg p-2 border border-slate-200 text-center shadow-sm">
              <p className="text-sm font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
              <p className={`text-xs mt-0.5 ${s.up ? 'text-green-600' : 'text-orange-500'}`}>{s.trend}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1 mt-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Live Alerts</p>
          {slide.alerts.slice(0, 3).map((a, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-2 py-1.5 border text-xs ${alertBg[a.type]}`}>
              <div className="flex items-center gap-1.5">
                <span>{a.icon}</span>
                <span className="text-slate-700 font-medium truncate max-w-[140px]">{a.text}</span>
              </div>
              <span className="text-primary font-semibold shrink-0 ml-1">{a.action} →</span>
            </div>
          ))}
        </div>
      </div>
    </AppScreenshotWithSidebar>
  );
}

function ScreenFinancials({ slide }) {
  const max = Math.max(...slide.months.map(m => m.expected));
  return (
    <AppScreenshotWithSidebar url="financials" activeNav="Financials">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800">Financial Dashboard</p>
          <span className="text-xs text-slate-400">April 2026</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-1">
          {slide.breakdown.map(b => (
            <div key={b.label} className={`rounded-lg p-2 border ${b.alert ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
              <p className="text-xs text-slate-500">{b.label}</p>
              <p className={`text-base font-bold ${b.alert ? 'text-red-600' : 'text-slate-900'}`}>{b.value}</p>
              <p className={`text-xs ${b.alert ? 'text-red-500' : 'text-slate-400'}`}>{b.note}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-2">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Rent Collection — 6 Months</p>
          <div className="flex items-end gap-1.5 h-14">
            {slide.months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end h-10">
                  <div className="w-full rounded-t-sm bg-slate-200" style={{ height: `${(m.expected / max) * 100}%` }}>
                    <div className={`w-full rounded-t-sm ${m.collected >= m.expected ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ height: `${(m.collected / m.expected) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppScreenshotWithSidebar>
  );
}

function ScreenPortals({ slide }) {
  return (
    <div className="space-y-2">
      {/* Tenant Portal screenshot */}
      <AppScreenshot title="Tenant Portal" url="tenant-self-service">
        <div className="flex items-center gap-2 mb-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">{slide.tenant.name[0]}</div>
          <div>
            <p className="text-xs font-bold text-slate-800">{slide.tenant.name}</p>
            <p className="text-xs text-slate-500">{slide.tenant.unit} · Rent {slide.tenant.status}</p>
          </div>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{slide.tenant.status}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {slide.tenant.actions.map(a => (
            <button key={a} className="text-xs bg-slate-100 text-slate-700 rounded px-1.5 py-2 font-medium text-center hover:bg-primary/10 leading-tight">{a}</button>
          ))}
        </div>
      </AppScreenshot>
      {/* Landlord Portal screenshot */}
      <AppScreenshot title="Landlord Portal" url="landlord-portal">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{slide.landlord.name[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">{slide.landlord.name}</p>
            <p className="text-xs text-slate-500 truncate">{slide.landlord.portfolio}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-primary">{slide.landlord.income}</p>
            <p className="text-xs text-slate-400">{slide.landlord.yield} yield</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 mt-2">
          {slide.landlord.actions.map(a => (
            <button key={a} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded px-1 py-1.5 font-medium text-center leading-tight">{a}</button>
          ))}
        </div>
      </AppScreenshot>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SlideshowDemo({ onGetStarted }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx, dir = 1) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setSlide(idx); setProgress(0); setAnimating(false); }, 300);
  }, [animating]);

  const goNext = useCallback(() => {
    goTo(slide < SLIDES.length - 1 ? slide + 1 : 0, 1);
  }, [slide, goTo]);

  const goPrev = useCallback(() => {
    if (slide > 0) goTo(slide - 1, -1);
  }, [slide, goTo]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { goNext(); return 0; }
        return p + (100 / (SLIDE_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, goNext]);

  const current = SLIDES[slide];

  const renderVisual = () => {
    switch (current.id) {
      case 'portfolio': return <ScreenPortfolio slide={current} />;
      case 'financials': return <ScreenFinancials slide={current} />;
      case 'btl': return <VisualBTL slide={current} />;
      default: return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-hidden flex flex-col select-none">
      {/* Slide container - full screen single box */}
      <div className="relative flex-1 w-full overflow-hidden bg-white">
        <div className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: animating ? 0 : 1 }}>
          <div className="h-full flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-5xl">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8 md:p-12">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                  {current.badge}
                </span>
                {current.audience && (
                  <p className="text-xs text-slate-400 mb-4">👥 {current.audience}</p>
                )}
                <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-snug">{current.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-10 text-lg lg:text-xl max-w-2xl">{current.desc}</p>

                <div className="bg-slate-50 rounded-xl p-6 md:p-8 border border-slate-200 mb-8 min-h-[320px] flex items-center justify-center">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-4">
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

                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={goPrev} disabled={slide === 0}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    ← Back
                  </button>
                  {slide < SLIDES.length - 1 ? (
                    <button onClick={goNext}
                      className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
                      Next →
                    </button>
                  ) : (
                    <button onClick={onGetStarted}
                      className="px-6 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition">
                      Get Started Free →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls (kiosk-friendly) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-6 flex justify-between items-center">
          <button onClick={goPrev} disabled={slide === 0} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm disabled:opacity-30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Indicator dots */}
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => { setPaused(false); goTo(i, i > slide ? 1 : -1); }}
                className={`h-2.5 rounded-full transition ${i === slide ? 'bg-white w-8' : 'bg-white/40 w-2.5'}`} />
            ))}
          </div>

          {/* Play/Pause */}
          <button onClick={() => setPaused(p => !p)} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            {paused ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>}
          </button>

          <button onClick={goNext} className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition backdrop-blur-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Progress bar top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200">
          <div className="h-full bg-primary transition-all duration-100"
            style={{ width: `${((slide + (paused ? 0 : progress / 100)) / SLIDES.length) * 100}%` }} />
        </div>

        {/* Slide counter */}
        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
          {slide + 1} / {SLIDES.length}
        </div>
      </div>
    </div>
  );
}