import React, { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  {
    id: 'dashboard',
    subtitle: 'Executive Dashboard',
    title: 'Your entire portfolio — at a glance',
    desc: 'A real-time command centre showing rent collection, compliance status, maintenance activity and occupancy across every property you manage. No spreadsheets. No chasing.',
    badge: '🏢 Portfolio Overview',
    audience: 'Letting Agents · Property Managers · Group Operators',
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
    audience: 'All property professionals — landlords to large agents',
    certs: [
      { name: 'Gas Safety (CP12)', property: '22 Oak Avenue', unit: 'Whole property', expires: 'EXPIRED', status: 'danger' },
      { name: 'Gas Safety (CP12)', property: '14 Willow Drive', unit: 'Flat 3', expires: '7 days', status: 'warning' },
      { name: 'EICR Certificate', property: 'Admiral Point', unit: 'Flat 4', expires: '42 days', status: 'ok' },
      { name: 'EPC Certificate', property: 'Reed Close', unit: 'Flat 8', expires: '6 months', status: 'ok' },
      { name: 'Fire Risk Assessment', property: 'Maple Court', unit: 'Block A', expires: '11 months', status: 'ok' },
    ],
    summary: { total: 94, compliant: 88, warning: 4, expired: 2 },
  },
  {
    id: 'btl',
    subtitle: 'Buy-to-Let Landlord',
    title: 'Your rental portfolio, professionally managed',
    desc: 'Whether you own one flat or twenty, Premiso gives you a landlord-grade platform. Track rent, certificates, tenancy dates and maintenance — without relying on a spreadsheet or chasing your agent.',
    badge: '🏠 Buy-to-Let & Small Portfolio',
    audience: 'Individual landlords · Small portfolio owners · Property investors',
    properties: [
      { address: '14 Willow Drive, Flat 3', tenant: 'Mr J. Harrison', rent: '£1,250/mo', status: 'Paid', yield: '5.8%', cert: 'warning' },
      { address: '8 Maple Close', tenant: 'Ms A. Patel', rent: '£975/mo', status: 'Paid', yield: '5.1%', cert: 'ok' },
      { address: '22 Oak Avenue', tenant: 'Mrs T. Singh', rent: '£1,400/mo', status: 'Overdue', yield: '6.2%', cert: 'danger' },
    ],
    summary: { income: '£3,625', yield: '5.7%', arrears: '£1,400', certs: 1 },
  },
  {
    id: 'block',
    subtitle: 'Block & Leasehold Management',
    title: 'Block management done properly',
    desc: 'Manage service charge budgets, major works consultations, building safety compliance, RTM companies and leaseholder communications — all from one purpose-built platform.',
    badge: '🏛️ Block Management',
    audience: 'Freeholders · Block management agents · RTM companies',
    blocks: [
      { name: 'Admiral Point', units: 24, sc_budget: '£148,000', collected: '£142,400', pending: 2, safety: 'ok' },
      { name: 'Maple Court', units: 12, sc_budget: '£72,000', collected: '£72,000', pending: 0, safety: 'warning' },
      { name: 'Reed Close', units: 8, sc_budget: '£44,000', collected: '£38,500', pending: 1, safety: 'ok' },
    ],
    tasks: [
      { label: 'Section 20 consultation open', block: 'Admiral Point', due: '14 days', type: 'warning' },
      { label: 'Building safety report due', block: 'Maple Court', due: '30 days', type: 'info' },
      { label: 'AGM scheduled', block: 'Reed Close', due: '6 weeks', type: 'ok' },
    ],
  },
  {
    id: 'maintenance',
    subtitle: 'Maintenance Workflow',
    title: 'From tenant report to job complete',
    desc: 'Tenants submit via their portal. Photos attach automatically. Contractors receive job packs instantly. You track progress on a real-time Kanban board — from first report to invoice approval.',
    badge: '🔧 Live Job Board',
    audience: 'Letting agents · Block managers · Property owners',
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
    audience: 'Letting agents · Block managers · Freeholders · Accountants',
    months: [
      { month: 'Nov', collected: 109200, expected: 112000 },
      { month: 'Dec', collected: 110500, expected: 112000 },
      { month: 'Jan', collected: 108400, expected: 112000 },
      { month: 'Feb', collected: 111800, expected: 112000 },
      { month: 'Mar', collected: 112000, expected: 112000 },
      { month: 'Apr', collected: 94400, expected: 112000 },
    ],
    breakdown: [
      { label: 'Rent Received', value: '£94,400', note: 'Month to date' },
      { label: 'Service Charges', value: '£12,800', note: 'All collected' },
      { label: 'Arrears', value: '£17,600', note: '3 tenants', alert: true },
      { label: 'Ground Rent', value: '£4,200', note: 'Quarterly due' },
    ],
  },
  {
    id: 'sales',
    subtitle: 'Sales & Estate Agency',
    title: 'Manage your sales pipeline end-to-end',
    desc: 'From valuation to completion — listings, buyer portals, viewing management, offer tracking and agent leaderboards. Fully joined up with your lettings and compliance data.',
    badge: '🤝 Sales CRM',
    audience: 'Estate agents · Hybrid letting & sales agents',
    listings: [
      { address: '12 Park Lane, London', price: '£485,000', status: 'Under Offer', viewings: 8, offers: 2, agent: 'S. Whitfield' },
      { address: '5 Brook Close, Surrey', price: '£320,000', status: 'Active', viewings: 4, offers: 0, agent: 'J. Marsden' },
      { address: '3 Victoria Rd, Brighton', price: '£275,000', status: 'Sold STC', viewings: 11, offers: 3, agent: 'S. Whitfield' },
    ],
    pipeline: [
      { stage: 'Valuations', count: 5, value: '£2.1M' },
      { stage: 'Listed', count: 12, value: '£5.4M' },
      { stage: 'Under Offer', count: 7, value: '£2.8M' },
      { stage: 'Exchanged', count: 3, value: '£1.1M' },
    ],
  },
  {
    id: 'portals',
    subtitle: 'Self-Service Portals',
    title: 'Portals for every stakeholder',
    desc: 'Tenants pay rent, raise jobs and access documents 24/7. Landlords view live statements and portfolio performance. Leaseholders check service charge accounts. Cut your inbound queries by up to 70%.',
    badge: '📱 Tenant, Landlord & Leaseholder Portals',
    audience: 'Tenants · Landlords · Leaseholders · Freeholders',
    tenant: {
      name: 'Sarah Johnson',
      unit: 'Flat 7, Admiral Point',
      rent: '£1,150/mo',
      nextDue: '1st May 2026',
      status: 'Up to date',
      actions: ['Pay Rent Online', 'Report a Problem', 'View Documents', 'Message Manager'],
      notifications: ['Your maintenance request has been assigned to a plumber'],
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
    id: 'outofhours',
    subtitle: 'Out-of-Hours Service',
    title: '24/7 emergency cover — built in',
    desc: 'No third-party answering service needed. Premiso handles out-of-hours calls, validates emergencies, escalates to contractors and logs every interaction — automatically. Full audit trail included.',
    badge: '📞 Out-of-Hours Call Handling',
    audience: 'Letting agents · Block managers · Property management companies',
    calls: [
      { time: '11:42pm', property: '22 Oak Avenue', type: 'Water leak', caller: 'S. Johnson', status: 'Escalated', contractor: 'A. Plumbing' },
      { time: '02:15am', property: 'Admiral Point Flat 3', type: 'No heating', caller: 'R. Khan', status: 'Resolved', contractor: 'Boiler Co.' },
      { time: '06:30am', property: 'Reed Close', type: 'Front door access', caller: 'M. Davies', status: 'Logged', contractor: null },
    ],
    stats: [
      { label: 'Calls This Month', value: '34' },
      { label: 'Avg Response', value: '8 min' },
      { label: 'Escalated', value: '18' },
      { label: 'Resolved', value: '97%' },
    ],
  },
  {
    id: 'contractor',
    subtitle: 'Contractor Portal',
    title: 'Jobs, quotes and invoices from the field',
    desc: 'Contractors get a dedicated mobile portal — see assigned jobs with full details, upload before/after photos, submit quotes and invoices, and track payment status. No phone calls. No paperwork.',
    badge: '🔧 Contractor & Supplier Portal',
    audience: 'Tradespeople · Specialist contractors · Building surveyors',
    jobs: [
      { title: 'Boiler repair — Flat 3', address: '22 Oak Avenue', status: 'In Progress', due: 'Today 2pm', value: null },
      { title: 'EICR inspection', address: 'Admiral Point', status: 'Scheduled', due: 'Thu 9am', value: null },
      { title: 'External door replacement', address: 'Maple Court', status: 'Quote Requested', due: 'By Fri', value: null },
      { title: 'Bathroom reseal', address: '14 Willow Drive', status: 'Invoice Submitted', due: '—', value: '£285' },
    ],
  },
  {
    id: 'reporting',
    subtitle: 'Reporting & Analytics',
    title: 'Reports that impress your clients',
    desc: "Monthly landlord statements, arrears summaries, maintenance cost breakdowns, service charge accounts and compliance audits — all branded with your logo. Delivered automatically.",
    badge: '📊 Automated Reporting',
    audience: 'All users — every role gets their own report suite',
    reports: [
      { name: 'Monthly Landlord Statement', desc: 'Income, expenses, net return per property', icon: '📄', time: 'Auto-sent 1st of month', popular: true },
      { name: 'Service Charge Accounts', desc: 'Budget vs actual, reserve fund, S.20 notices', icon: '🏛️', time: 'Quarterly', popular: true },
      { name: 'Compliance Audit Report', desc: 'Certificate status across all properties', icon: '🛡️', time: 'Weekly digest', popular: false },
      { name: 'Arrears & Collections', desc: 'Outstanding rent with full chase history', icon: '💸', time: 'Real-time', popular: false },
      { name: 'Portfolio Performance', desc: 'Occupancy, yield, void periods, trends', icon: '📈', time: 'Quarterly', popular: false },
    ],
  },
  {
    id: 'getstarted',
    subtitle: 'Get Started',
    title: 'One platform. Every role in property.',
    desc: "From a single buy-to-let landlord to a 5,000-unit management group — Premiso scales with you. Full onboarding support. Live from day one. No long contracts.",
    badge: '🚀 Ready to Go',
    audience: 'Landlords · Agents · Block managers · Freeholders · Investors',
    pricing: [
      { tier: 'Starter', price: '£99', units: 'Up to 50 units', features: ['Properties & unit management', 'Tenant & landlord portal', 'Maintenance workflow', 'Basic compliance certificates'] },
      { tier: 'Professional', price: '£249', units: 'Up to 250 units', features: ['Everything in Starter', 'Block & leasehold management', 'Accounting sync (Xero/Sage/QB)', 'Full compliance hub', 'Sales CRM'], highlight: true },
      { tier: 'Enterprise', price: 'Custom', units: 'Unlimited units', features: ['Everything in Professional', 'White-label & custom branding', 'Dedicated onboarding', 'SLA guarantee'] },
    ],
  },
];

const SLIDE_DURATION = 7000;

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
              <span className="text-slate-700 font-medium text-xs">{a.text}</span>
            </div>
            <span className="text-xs text-primary font-semibold whitespace-nowrap ml-2">{a.action} →</span>
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

function VisualBlock({ slide }) {
  const taskColor = { warning: 'bg-amber-50 border-amber-200 text-amber-800', info: 'bg-blue-50 border-blue-200 text-blue-800', ok: 'bg-green-50 border-green-200 text-green-800' };
  return (
    <div className="space-y-3">
      {slide.blocks.map((b, i) => (
        <div key={i} className="bg-white border rounded-xl px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold text-slate-800">{b.name} <span className="font-normal text-slate-400">· {b.units} units</span></p>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${certStatusColor[b.safety]}`}>
              {b.safety === 'ok' ? 'Safety OK' : 'Action needed'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><p className="text-slate-400">Budget</p><p className="font-semibold text-slate-700">{b.sc_budget}</p></div>
            <div><p className="text-slate-400">Collected</p><p className="font-semibold text-green-700">{b.collected}</p></div>
            <div><p className="text-slate-400">Pending</p><p className={`font-semibold ${b.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{b.pending} leaseholder{b.pending !== 1 ? 's' : ''}</p></div>
          </div>
        </div>
      ))}
      <div className="space-y-1.5">
        {slide.tasks.map((t, i) => (
          <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border text-xs ${taskColor[t.type]}`}>
            <span className="font-medium">{t.label} — {t.block}</span>
            <span className="text-xs opacity-70 whitespace-nowrap ml-2">{t.due}</span>
          </div>
        ))}
      </div>
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
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColor[job.priority]}`}>{job.priority}</span>
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

function VisualSales({ slide }) {
  const statusColor = { 'Under Offer': 'bg-amber-100 text-amber-700', 'Active': 'bg-blue-100 text-blue-700', 'Sold STC': 'bg-green-100 text-green-700' };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 mb-1">
        {slide.pipeline.map(p => (
          <div key={p.stage} className="bg-white border rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-slate-900">{p.count}</p>
            <p className="text-xs text-slate-500 leading-tight">{p.stage}</p>
            <p className="text-xs font-medium text-primary">{p.value}</p>
          </div>
        ))}
      </div>
      {slide.listings.map((l, i) => (
        <div key={i} className="bg-white border rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{l.address}</p>
            <p className="text-xs text-slate-500">{l.price} · {l.viewings} viewings · {l.offers} offers · {l.agent}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[l.status]}`}>{l.status}</span>
        </div>
      ))}
    </div>
  );
}

function VisualPortals({ slide }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{slide.tenant.name[0]}</div>
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
          <p className="text-xs text-blue-600">{slide.tenant.notifications[0]}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">{slide.landlord.name[0]}</div>
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

function VisualOutOfHours({ slide }) {
  const statusColor = { 'Escalated': 'bg-amber-100 text-amber-700', 'Resolved': 'bg-green-100 text-green-700', 'Logged': 'bg-blue-100 text-blue-700' };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 mb-1">
        {slide.stats.map(s => (
          <div key={s.label} className="bg-white border rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Calls</p>
      {slide.calls.map((c, i) => (
        <div key={i} className="bg-white border rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800">{c.type} — {c.property}</p>
            <p className="text-xs text-slate-500">{c.time} · {c.caller}{c.contractor ? ` · ${c.contractor}` : ''}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[c.status]}`}>{c.status}</span>
        </div>
      ))}
    </div>
  );
}

function VisualContractor({ slide }) {
  const statusColor = {
    'In Progress': 'bg-orange-100 text-orange-700',
    'Scheduled': 'bg-blue-100 text-blue-700',
    'Quote Requested': 'bg-purple-100 text-purple-700',
    'Invoice Submitted': 'bg-green-100 text-green-700',
  };
  return (
    <div className="space-y-2">
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center gap-3 mb-2">
        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
        <div>
          <p className="text-xs font-bold text-slate-800">Ace Plumbing & Heating</p>
          <p className="text-xs text-slate-500">4 active jobs · 2 invoices awaiting payment</p>
        </div>
      </div>
      {slide.jobs.map((j, i) => (
        <div key={i} className="bg-white border rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{j.title}</p>
            <p className="text-xs text-slate-500">{j.address} · {j.due}{j.value ? ` · ${j.value}` : ''}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[j.status]}`}>{j.status}</span>
        </div>
      ))}
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
          <button onClick={onGetStarted}
            className={`mt-3 w-full text-xs font-bold py-2 rounded-lg transition ${p.highlight ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
            Get Started
          </button>
        </div>
      ))}
    </div>
  );
}

// ── App Screenshot Screen Components ─────────────────────────────────────────

function ScreenDashboard({ slide }) {
  return (
    <AppScreenshotWithSidebar url="dashboard" activeNav="Dashboard">
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

function ScreenCompliance({ slide }) {
  return (
    <AppScreenshotWithSidebar url="certificate-compliance" activeNav="Compliance">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800">Certificate Compliance Hub</p>
          <div className="flex gap-1">
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">{slide.summary.expired} Expired</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">{slide.summary.warning} Warning</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 mb-1">
          {[
            { label: 'Total', value: slide.summary.total, color: 'bg-slate-100 text-slate-700' },
            { label: 'Compliant', value: slide.summary.compliant, color: 'bg-green-100 text-green-700' },
            { label: 'Expiring', value: slide.summary.warning, color: 'bg-amber-100 text-amber-700' },
            { label: 'Expired', value: slide.summary.expired, color: 'bg-red-100 text-red-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-1.5 text-center ${s.color}`}>
              <p className="text-base font-bold">{s.value}</p>
              <p className="text-xs">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="text-left px-2 py-1.5 font-semibold">Certificate</th>
                <th className="text-left px-2 py-1.5 font-semibold">Property</th>
                <th className="text-right px-2 py-1.5 font-semibold">Expires</th>
              </tr>
            </thead>
            <tbody>
              {slide.certs.map((c, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-2 py-1.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-2 py-1.5 text-slate-500 truncate max-w-[80px]">{c.property}</td>
                  <td className="px-2 py-1.5 text-right">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold border ${certStatusColor[c.status]}`}>{c.expires}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppScreenshotWithSidebar>
  );
}

function ScreenBlock({ slide }) {
  return (
    <AppScreenshotWithSidebar url="block-management" activeNav="Properties">
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-800">Block Management Overview</p>
        {slide.blocks.map((b, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-slate-800">{b.name} <span className="font-normal text-slate-400">· {b.units} units</span></p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${certStatusColor[b.safety]}`}>
                {b.safety === 'ok' ? '✓ Safety' : '⚠ Action'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div className="bg-slate-50 rounded p-1 text-center"><p className="font-semibold text-slate-700">{b.sc_budget}</p><p className="text-slate-400">Budget</p></div>
              <div className="bg-green-50 rounded p-1 text-center"><p className="font-semibold text-green-700">{b.collected}</p><p className="text-slate-400">Collected</p></div>
              <div className={`rounded p-1 text-center ${b.pending > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}><p className={`font-semibold ${b.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{b.pending}</p><p className="text-slate-400">Pending</p></div>
            </div>
          </div>
        ))}
        <div className="space-y-1">
          {slide.tasks.map((t, i) => (
            <div key={i} className={`flex items-center justify-between rounded px-2 py-1.5 text-xs border ${t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <span className="font-medium">{t.label}</span>
              <span className="opacity-70">{t.due}</span>
            </div>
          ))}
        </div>
      </div>
    </AppScreenshotWithSidebar>
  );
}

function ScreenMaintenance({ slide }) {
  return (
    <AppScreenshotWithSidebar url="maintenance-board" activeNav="Maintenance">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-slate-800">Maintenance Kanban Board</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Live Job Board</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {slide.columns.map(col => (
            <div key={col.label} className={`rounded-lg border-2 p-1.5 ${colColor[col.color]}`}>
              <div className={`text-white text-xs font-bold rounded px-1.5 py-0.5 mb-1.5 inline-block ${colHeaderColor[col.color]}`}>
                {col.label} ({col.jobs.length})
              </div>
              <div className="space-y-1.5">
                {col.jobs.map((job, i) => (
                  <div key={i} className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-800 leading-tight mb-1">{job.title}</p>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs px-1 py-0.5 rounded font-medium ${priorityColor[job.priority]}`}>{job.priority}</span>
                      <span className="text-xs text-slate-400">{job.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
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

function ScreenOutOfHours({ slide }) {
  const statusColor = { 'Escalated': 'bg-amber-100 text-amber-700', 'Resolved': 'bg-green-100 text-green-700', 'Logged': 'bg-blue-100 text-blue-700' };
  return (
    <AppScreenshotWithSidebar url="out-of-hours" activeNav="Out-of-Hours">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Out-of-Hours Call Centre</p>
            <p className="text-xs text-slate-400">24/7 Emergency Management</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold animate-pulse">● Live</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {slide.stats.map(s => (
            <div key={s.label} className="bg-white border rounded-lg p-1.5 text-center">
              <p className="text-sm font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white">Recent Calls</div>
          {slide.calls.map((c, i) => (
            <div key={i} className={`flex items-center justify-between px-2 py-2 text-xs border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 truncate">{c.type} — {c.property}</p>
                <p className="text-slate-400">{c.time} · {c.caller}</p>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2 ${statusColor[c.status]}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AppScreenshotWithSidebar>
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
      case 'dashboard': return <ScreenDashboard slide={current} />;
      case 'compliance': return <ScreenCompliance slide={current} />;
      case 'btl': return <VisualBTL slide={current} />;
      case 'block': return <ScreenBlock slide={current} />;
      case 'maintenance': return <ScreenMaintenance slide={current} />;
      case 'financials': return <ScreenFinancials slide={current} />;
      case 'sales': return <VisualSales slide={current} />;
      case 'portals': return <ScreenPortals slide={current} />;
      case 'outofhours': return <ScreenOutOfHours slide={current} />;
      case 'contractor': return <VisualContractor slide={current} />;
      case 'reporting': return <VisualReporting slide={current} />;
      case 'getstarted': return <VisualGetStarted slide={current} onGetStarted={onGetStarted} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto select-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Progress bars */}
      <div className="flex gap-1 mb-5">
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => { setPaused(false); goTo(i, i > slide ? 1 : -1); }}
            className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden" title={s.subtitle}>
            <div className="h-full bg-primary rounded-full"
              style={{ width: i < slide ? '100%' : i === slide ? `${progress}%` : '0%', transition: i === slide ? 'width 0.1s linear' : 'none' }} />
          </button>
        ))}
      </div>

      {/* Slide */}
      <div className="transition-all duration-300"
        style={{ opacity: animating ? 0 : 1, transform: animating ? `translateX(${direction * -24}px)` : 'translateX(0)' }}>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: text */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              {current.badge}
            </span>
            {current.audience && (
              <p className="text-xs text-slate-400 mb-2">👥 {current.audience}</p>
            )}
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-snug">{current.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm lg:text-base">{current.desc}</p>

            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={goPrev} disabled={slide === 0}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                ← Back
              </button>
              {slide < SLIDES.length - 1 ? (
                <button onClick={goNext}
                  className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
                  Next →
                </button>
              ) : (
                <button onClick={onGetStarted}
                  className="px-6 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition">
                  Get Started Free →
                </button>
              )}
              <button onClick={() => setPaused(p => !p)}
                className="ml-auto px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50 transition">
                {paused ? '▶ Play' : '⏸ Pause'}
              </button>
            </div>
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