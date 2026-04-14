import React, { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    id: 'portfolio-overview',
    subtitle: 'Portfolio Management',
    title: 'See all your properties at a glance',
    desc: 'Real-time dashboard showing occupancy, rent collection, compliance status, and maintenance activity across your entire portfolio.',
    badge: '🏢 Portfolio Overview',
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
    id: 'portfolio-compliance',
    subtitle: 'Portfolio Management',
    title: 'Stay on top of compliance',
    desc: 'Monitor gas safety certificates, electrical inspections, deposits, and safety records across all properties with automated alerts.',
    badge: '🛡️ Compliance Tracking',
    audience: 'Letting Agents · Property Managers',
    stats: [
      { label: 'Compliant', value: '44/47', trend: 'Properties up to date', up: true },
      { label: 'Expiring Soon', value: '3', trend: 'Within 30 days', up: false },
      { label: 'Overdue', value: '0', trend: 'All current', up: true },
      { label: 'Alerts Set', value: '92', trend: 'Active notifications', up: true },
    ],
    alerts: [
      { type: 'danger', icon: '🔴', text: 'Gas cert EXPIRED — 22 Oak Avenue', action: 'Book engineer' },
      { type: 'warning', icon: '🟡', text: 'EICR expiring in 14 days — 8 Maple Close', action: 'Schedule now' },
      { type: 'info', icon: '🔵', text: 'Deposit protection due — 4 units', action: 'Renew' },
    ],
  },
  {
    id: 'financials-overview',
    subtitle: 'Financial Management',
    title: 'Know your numbers instantly',
    desc: "Real-time rent collection tracking, arrears management, expense breakdown, and profitability per property.",
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
    id: 'financials-reporting',
    subtitle: 'Financial Management',
    title: 'Generate professional reports',
    desc: "Monthly statements, tax-ready summaries, and yield analysis for each property. Export reports for accountants and stakeholders.",
    badge: '📊 Financial Reports',
    audience: 'Property Owners · Investors · Accountants',
    breakdown: [
      { label: 'Gross Income', value: '£112,000', note: 'Monthly average' },
      { label: 'Expenses', value: '£24,500', note: 'Maintenance & fees' },
      { label: 'Net Yield', value: '6.8%', note: 'Portfolio average' },
      { label: 'Tax Due', value: '£18,400', note: 'Estimated annual' },
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
    id: 'maintenance-overview',
    subtitle: 'Maintenance & Contractors',
    title: 'Manage repairs from start to finish',
    desc: "Track maintenance requests, assign contractors, get job updates, and manage invoices all in one place.",
    badge: '🔧 Maintenance Hub',
    audience: 'Property Managers · Landlords',
    breakdown: [
      { label: 'Open Jobs', value: '12', note: 'Awaiting contractor' },
      { label: 'In Progress', value: '8', note: 'Work ongoing' },
      { label: 'Completed', value: '134', note: 'This year' },
      { label: 'Pending Invoice', value: '3', note: 'Awaiting approval' },
    ],
  },
  {
    id: 'maintenance-contractors',
    subtitle: 'Maintenance & Contractors',
    title: 'Build your trusted contractor network',
    desc: "Rate and review contractors, track certifications, manage quotes, and build long-term relationships with reliable tradespeople.",
    badge: '👷 Contractor Management',
    audience: 'Property Managers · Landlords · Agents',
    breakdown: [
      { label: 'Approved Contractors', value: '24', note: 'Fully vetted' },
      { label: 'Avg Response Time', value: '2.3 hrs', note: 'Emergency calls' },
      { label: 'Average Rating', value: '4.7★', note: 'From 156 reviews' },
      { label: 'Insurance Verified', value: '22/24', note: 'Current policies' },
    ],
  },
  {
    id: 'block-overview',
    subtitle: 'Block & Leasehold Management',
    title: 'Manage buildings, not just properties',
    desc: "Comprehensive tools for service charge accounting, leaseholder communication, reserve funds, and RTM workflows.",
    badge: '🏢 Block Management',
    audience: 'Managing Agents · Freeholders · RTM Companies',
    breakdown: [
      { label: 'Buildings Managed', value: '18', note: '342 leaseholders' },
      { label: 'Service Charge Collected', value: '£89,400', note: 'Year to date' },
      { label: 'Reserve Fund', value: '£145,600', note: '3-year plan' },
      { label: 'Outstanding Invoices', value: '£8,200', note: '12 arrears' },
    ],
  },
  {
    id: 'block-compliance',
    subtitle: 'Block & Leasehold Management',
    title: 'Meet building safety regulations',
    desc: "Fire safety certificates, building regulations, electrical testing, and structural inspections all tracked and scheduled.",
    badge: '🔒 Building Safety Register',
    audience: 'Managing Agents · Building Controllers',
    breakdown: [
      { label: 'Fire Safety Status', value: '18/18', note: 'All current' },
      { label: 'EPC Certificates', value: '100%', note: 'Compliant' },
      { label: 'Electrical Testing', value: '17/18', note: '1 due 28 Apr' },
      { label: 'Insurance Updated', value: '18/18', note: 'Current policies' },
    ],
  },
  {
    id: 'tenants-portal',
    subtitle: 'Tenant Engagement',
    title: 'Empower tenants to self-serve',
    desc: "Pay rent, submit maintenance requests, view documents, and message landlords 24/7 through their own secure portal.",
    badge: '📱 Tenant Portal',
    audience: 'All Property Owners & Agents',
    breakdown: [
      { label: 'Online Payments', value: '73%', note: 'Of monthly rent' },
      { label: 'Support Tickets', value: '24', note: 'Avg 2.1hr response' },
      { label: 'Portal Logins', value: '312', note: 'Last 30 days' },
      { label: 'Satisfaction', value: '4.6★', note: 'From 98 reviews' },
    ],
  },
  {
    id: 'landlord-reporting',
    subtitle: 'Reporting & Analytics',
    title: 'Make data-driven decisions',
    desc: "Custom reports, KPI dashboards, market insights, and automated monthly statements sent to landlords and accountants.",
    badge: '📈 Advanced Analytics',
    audience: 'Property Owners · Portfolio Managers',
    breakdown: [
      { label: 'Portfolio Yield', value: '6.2%', note: 'VS 5.1% avg' },
      { label: 'Occupancy Rate', value: '96.8%', note: 'Above target' },
      { label: 'Avg Days Vacant', value: '8.3', note: '↓ -2.1 days' },
      { label: 'Expenses', value: '£24.5k', note: 'On budget' },
    ],
  },
  {
    id: 'ooh-service',
    subtitle: 'Out-of-Hours Support',
    title: '24/7 emergency call centre',
    desc: "Professional on-call team handles emergency callouts, tenant complaints, and urgent maintenance with transparent pricing.",
    badge: '📞 Out-of-Hours Service',
    audience: 'Agents · Landlords · Freeholders',
    breakdown: [
      { label: 'Calls Handled', value: '847', note: 'Last month' },
      { label: 'Avg Response', value: '3.2 min', note: 'Emergency calls' },
      { label: 'Resolution Rate', value: '67%', note: 'First contact' },
      { label: 'Cost Per Call', value: '£28–£89', note: 'Tiered pricing' },
    ],
  },
  {
    id: 'automation',
    subtitle: 'Workflows & Automation',
    title: 'Automate repetitive tasks',
    desc: "Smart workflows for rent reminders, compliance alerts, document generation, and contractor scheduling—saving hours every week.",
    badge: '⚡ Smart Workflows',
    audience: 'All Users',
    breakdown: [
      { label: 'Active Workflows', value: '34', note: 'Custom automations' },
      { label: 'Hours Saved', value: '18.5', note: 'Per week per user' },
      { label: 'Error Rate', value: '0.3%', note: 'vs 8% manual' },
      { label: 'Integrations', value: '12', note: 'Connected systems' },
    ],
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
      case 'portfolio-overview':
      case 'portfolio-compliance':
        return <ScreenPortfolio slide={current} />;
      case 'financials-overview':
      case 'financials-reporting':
        return <ScreenFinancials slide={current} />;
      case 'maintenance-overview':
      case 'maintenance-contractors':
        return <VisualBTL slide={current} />;
      case 'block-overview':
      case 'block-compliance':
        return <VisualFinancials slide={current} />;
      case 'tenants-portal':
      case 'landlord-reporting':
        return <VisualBTL slide={current} />;
      case 'ooh-service':
      case 'automation':
        return <VisualFinancials slide={current} />;
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