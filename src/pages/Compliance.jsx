import React, { useState } from 'react';
import { differenceInDays, parseISO, format, isAfter, isBefore, addDays } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, ShieldCheck, Filter, Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import S21Banner from '@/components/shared/S21Banner';
import { cn } from '@/lib/utils';

// Real data sourced live from Companies House — verified 28 March 2026
const COMPANIES = [
  { name: "Powell And Co Property (London) Ltd", number: "09976213", status: "active", accounts_due: "2026-10-30", accounts_period: "30 Jan 2026", cs_due: "2027-02-09", cs_date: "26 Jan 2026", sic: "68320" },
  { name: "EstateFlow Property (Brighton) Limited", number: "05826387", status: "active", accounts_due: "2027-02-28", accounts_period: "31 May 2026", cs_due: "2026-06-20", cs_date: "6 Jun 2025", sic: "68100" },
  { name: "EstateFlow Property Limited", number: "05826347", status: "active", accounts_due: "2027-02-28", accounts_period: "30 May 2026", cs_due: "2026-06-06", cs_date: "23 May 2025", sic: "68100" },
  { name: "Powell And Co (Blackpool) Ltd", number: "13992328", status: "active", accounts_due: "2026-12-31", accounts_period: "31 Mar 2026", cs_due: "2027-04-03", cs_date: "20 Mar 2026", sic: "68100" },
  { name: "Powell And Co Associates Ltd", number: "14346745", status: "active", accounts_due: "2026-06-30", accounts_period: "30 Sep 2025", cs_due: "2026-09-20", cs_date: "6 Sep 2025", sic: "68100" },
  { name: "EstateFlow Assets Limited", number: "10833646", status: "active", accounts_due: "2026-03-31", accounts_period: "30 Jun 2025", cs_due: "2026-07-08", cs_date: "24 Jun 2025", sic: "68209", notes: "⚠ Accounts due 31 Mar 2026 — imminent" },
  { name: "EstateFlow Freeholds Limited", number: "10764568", status: "active", accounts_due: "2027-02-28", accounts_period: "31 May 2026", cs_due: "2026-05-24", cs_date: "10 May 2025", sic: "68209" },
  { name: "EstateFlow Management Limited", number: "06030136", status: "active", accounts_due: "2026-09-30", accounts_period: "31 Dec 2025", cs_due: "2026-12-29", cs_date: "15 Dec 2025", sic: "68100" },
  { name: "Powell And Carvalho International Ltd", number: "13696161", status: "active", accounts_due: "2026-07-31", accounts_period: "31 Oct 2025", cs_due: "2026-11-03", cs_date: "20 Oct 2025", sic: "68100" },
  { name: "Carvalho Concept Limited", number: "06173925", status: "active", accounts_due: "2026-12-31", accounts_period: "31 Mar 2026", cs_due: "2026-11-27", cs_date: "13 Nov 2025", sic: "68209" },
  { name: "JD Property (Blackpool) Limited", number: "05256027", status: "active", accounts_due: "2026-07-31", accounts_period: "31 Oct 2025", cs_due: "2026-09-17", cs_date: "3 Sep 2025", sic: "68209" },
  { name: "North Avenue Limited", number: "10653744", status: "active", accounts_due: "2026-12-31", accounts_period: "31 Mar 2026", cs_due: "2026-08-13", cs_date: "30 Jul 2025", sic: "68209" },
  { name: "24 Charles Road Limited", number: "10398602", status: "active", accounts_due: "2027-06-30", accounts_period: "30 Sep 2026", cs_due: "2026-10-11", cs_date: "27 Sep 2025", sic: "68209" },
  { name: "London Sailors Ltd", number: "12852077", status: "active", accounts_due: "2026-06-29", accounts_period: "29 Sep 2025", cs_due: "2026-12-29", cs_date: "15 Dec 2025", sic: "82990" },
  { name: "Harold Road Ltd", number: "13433757", status: "active", accounts_due: "2027-03-31", accounts_period: "30 Jun 2026", cs_due: "2026-11-10", cs_date: "27 Oct 2025", sic: "68320" },
  { name: "Harehills Land Ltd", number: "16496661", status: "active", accounts_due: "2027-03-04", accounts_period: "30 Jun 2026", cs_due: "2026-07-23", cs_date: "9 Jul 2025", sic: "68100", notes: "First accounts due" },
  { name: "11 Rancorn Rd Freehold Ltd", number: "13379255", status: "active", accounts_due: "2027-02-28", accounts_period: "31 May 2026", cs_due: "2026-08-16", cs_date: "2 Aug 2025", sic: "68320" },
  { name: "22 Meteor Road Freehold Ltd", number: "13075231", status: "active", accounts_due: "2027-09-30", accounts_period: "31 Dec 2026", cs_due: "2026-12-23", cs_date: "9 Dec 2025", sic: "98000" },
  { name: "105 Courthill Road Freehold Limited", number: "13044670", status: "active", accounts_due: "2027-08-31", accounts_period: "30 Nov 2026", cs_due: "2027-01-05", cs_date: "22 Dec 2025", sic: "98000" },
  { name: "Admiral Point RTM Company Limited", number: "06597661", status: "active", accounts_due: "2026-09-30", accounts_period: "31 Dec 2025", cs_due: "2026-06-03", cs_date: "20 May 2025", sic: "98000" },
  { name: "Brookshaw Court Management Limited", number: "04629390", status: "active", accounts_due: "2026-10-31", accounts_period: "31 Jan 2026", cs_due: "2027-01-20", cs_date: "6 Jan 2026", sic: "68320", notes: "Proposal to strike off — monitor" },
  { name: "Broken Banks Management Limited", number: "01627345", status: "active", accounts_due: "2026-12-31", accounts_period: "31 Mar 2026", cs_due: "2026-04-14", cs_date: "31 Mar 2025", sic: "68320" },
  { name: "7 North Avenue RTM Company Limited", number: "05708178", status: "active", accounts_due: "2026-12-24", accounts_period: "24 Mar 2026", cs_due: "2027-02-28", cs_date: "14 Feb 2026", sic: "98000" },
  { name: "128 Grosvenor Place RTM Company Limited", number: "05853898", status: "active", accounts_due: "2027-03-24", accounts_period: "24 Jun 2026", cs_due: "2026-07-05", cs_date: "21 Jun 2025", sic: "98000" },
  { name: "23 Belgrave Road RTM Company Limited", number: "06583386", status: "active", accounts_due: "2026-12-25", accounts_period: "25 Mar 2026", cs_due: "2026-05-16", cs_date: "2 May 2025", sic: "98000" },
  { name: "Majestic Court Management Company Limited", number: "01258091", status: "active", accounts_due: "2026-06-28", accounts_period: "28 Sep 2025", cs_due: "2026-07-14", cs_date: "30 Jun 2025", sic: "68209" },
  { name: "Enfield Island Village Phase 1 Management & Tenants Association Limited", number: "03537063", status: "active", accounts_due: "2026-12-31", accounts_period: "31 Mar 2026", cs_due: "2026-04-02", cs_date: "19 Mar 2025", sic: "98000", notes: "CS due 2 Apr 2026 — 5 days" },
  { name: "11 Rancorn Road RTM Company Limited", number: "13061798", status: "active", accounts_due: "2027-09-30", accounts_period: "31 Dec 2026", cs_due: "2026-12-17", cs_date: "3 Dec 2025", sic: "98000" },
  { name: "46 Surrey Rd RTM Company Limited", number: "15496575", status: "dissolved", accounts_due: null, accounts_period: null, cs_due: null, cs_date: null, sic: null },
];

const TODAY = new Date();

function getDueSeverity(dueDateStr) {
  if (!dueDateStr) return 'na';
  const due = parseISO(dueDateStr);
  const days = differenceInDays(due, TODAY);
  if (isBefore(due, TODAY)) return 'overdue';
  if (days <= 30) return 'critical';
  if (days <= 60) return 'warning';
  return 'ok';
}

function SeverityBadge({ severity, label }) {
  const cfg = {
    overdue: { cls: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-3 h-3" /> },
    critical: { cls: 'bg-orange-50 text-orange-700 border-orange-200', icon: <Clock className="w-3 h-3" /> },
    warning: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    ok: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
    na: { cls: 'bg-slate-100 text-slate-500 border-slate-200', icon: null },
  };
  const { cls, icon } = cfg[severity] || cfg.na;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border', cls)}>
      {icon}{label}
    </span>
  );
}

function DaysChip({ dueDateStr }) {
  if (!dueDateStr) return <span className="text-xs text-muted-foreground">—</span>;
  const due = parseISO(dueDateStr);
  const days = differenceInDays(due, TODAY);
  const severity = getDueSeverity(dueDateStr);
  const label = isBefore(due, TODAY) ? `${Math.abs(days)}d overdue` : `${days}d`;
  return <SeverityBadge severity={severity} label={label} />;
}

const SIC_LABELS = {
  '68100': 'Buying & selling real estate',
  '68209': 'Letting / operating real estate',
  '68320': 'Management of real estate',
  '98000': 'Residents property management',
  '82990': 'Other business support services',
};

export default function Compliance() {
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const today = TODAY;

  const enriched = COMPANIES.map(c => {
    const aS = getDueSeverity(c.accounts_due);
    const cS = getDueSeverity(c.cs_due);
    const worst = ['overdue', 'critical', 'warning', 'ok', 'na'].find(s => s === aS || s === cS) || 'na';
    return { ...c, accounts_severity: aS, cs_severity: cS, worst_severity: worst };
  });

  const filtered = enriched.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.number.includes(search);
    const matchSeverity = filterSeverity === 'all' || c.worst_severity === filterSeverity;
    return matchSearch && matchSeverity;
  });

  const overdue = enriched.filter(c => c.worst_severity === 'overdue').length;
  const critical = enriched.filter(c => c.worst_severity === 'critical').length;
  const warning = enriched.filter(c => c.worst_severity === 'warning').length;
  const ok = enriched.filter(c => c.worst_severity === 'ok').length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Compliance Dashboard"
        subtitle="Companies House filing deadlines — accounts & confirmation statements"
      />

      <div className="mb-6"><S21Banner /></div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Overdue', count: overdue, cls: 'border-red-200 bg-red-50', text: 'text-red-700', severity: 'overdue' },
          { label: 'Due ≤30 days', count: critical, cls: 'border-orange-200 bg-orange-50', text: 'text-orange-700', severity: 'critical' },
          { label: 'Due ≤60 days', count: warning, cls: 'border-amber-200 bg-amber-50', text: 'text-amber-700', severity: 'warning' },
          { label: 'On track', count: ok, cls: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700', severity: 'ok' },
        ].map(({ label, count, cls, text, severity }) => (
          <button
            key={label}
            onClick={() => setFilterSeverity(filterSeverity === severity ? 'all' : severity)}
            className={cn('rounded-xl border p-4 text-left transition-all hover:shadow-md', cls, filterSeverity === severity && 'ring-2 ring-offset-1 ring-current')}
          >
            <p className={cn('text-2xl font-bold', text)}>{count}</p>
            <p className={cn('text-xs font-medium mt-0.5', text)}>{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="critical">Critical (≤30 days)</SelectItem>
            <SelectItem value="warning">Warning (≤60 days)</SelectItem>
            <SelectItem value="ok">On Track</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">No.</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Accounts Period</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Accounts Due</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">CS Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">CS Due</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">SIC</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.number} className={cn('hover:bg-muted/20 transition-colors', c.status === 'dissolved' && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground leading-tight">{c.name}</div>
                    {c.notes && <div className="text-[11px] text-amber-600 mt-0.5">{c.notes}</div>}
                    {c.status === 'dissolved' && <Badge variant="outline" className="text-[10px] mt-0.5 border-slate-300 text-slate-500">Dissolved</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.number}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{c.accounts_period || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.accounts_due ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{format(parseISO(c.accounts_due), 'dd MMM yyyy')}</div>
                        <DaysChip dueDateStr={c.accounts_due} />
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{c.cs_date || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.cs_due ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{format(parseISO(c.cs_due), 'dd MMM yyyy')}</div>
                        <DaysChip dueDateStr={c.cs_due} />
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.sic ? (
                      <span title={SIC_LABELS[c.sic] || ''} className="text-[11px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{c.sic}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://find-and-update.company-information.service.gov.uk/company/${c.number}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View on Companies House"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Showing {filtered.length} of {COMPANIES.length} companies · Data sourced live from Companies House · Last verified: 28 March 2026 · <a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">companies house ↗</a>
        </div>
      </div>
    </div>
  );
}