import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, parseISO, format, isBefore } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, ShieldCheck, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import S21Banner from '@/components/shared/S21Banner';
import { cn } from '@/lib/utils';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import CertificateUploadDialog from '@/components/compliance/CertificateUploadDialog';

const TODAY = new Date();

const SIC_LABELS = {
  '68100': 'Buying & selling real estate',
  '68209': 'Letting / operating real estate',
  '68320': 'Management of real estate',
  '98000': 'Residents property management',
  '82990': 'Other business support services',
};

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

export default function Compliance() {
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const { demoCompanyId, loading: demoLoading } = useDemoFilter();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies-compliance', demoCompanyId],
    queryFn: async () => {
      if (demoCompanyId) {
        const c = await base44.entities.Company.get(demoCompanyId);
        return c ? [c] : [];
      }
      return base44.entities.Company.list('-created_date', 200);
    },
    enabled: !demoLoading,
  });

  // Map entity fields → display model
  const enriched = companies.map(c => {
    const aS = getDueSeverity(c.accounts_next_due);
    const cS = getDueSeverity(c.confirmation_next_due);
    const worst = ['overdue', 'critical', 'warning', 'ok', 'na'].find(s => s === aS || s === cS) || 'na';
    return {
      ...c,
      number: c.company_number,
      accounts_due: c.accounts_next_due,
      accounts_period: c.accounts_last_made_up,
      cs_due: c.confirmation_next_due,
      cs_date: c.confirmation_last_dated,
      sic: c.sic_code,
      accounts_severity: aS,
      cs_severity: cS,
      worst_severity: worst,
    };
  });

  const filtered = enriched.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.number?.includes(search);
    const matchSeverity = filterSeverity === 'all' || c.worst_severity === filterSeverity;
    return matchSearch && matchSeverity;
  });

  const overdue = enriched.filter(c => c.worst_severity === 'overdue').length;
  const critical = enriched.filter(c => c.worst_severity === 'critical').length;
  const warning = enriched.filter(c => c.worst_severity === 'warning').length;
  const ok = enriched.filter(c => c.worst_severity === 'ok').length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <CertificateUploadDialog open={showUpload} onClose={() => setShowUpload(false)} />
      <PageHeader
        title="Compliance Dashboard"
        subtitle="Companies House filing deadlines — accounts & confirmation statements"
      >
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Upload className="w-4 h-4" /> Upload Certificate
        </Button>
      </PageHeader>

      <div className="mb-6"><S21Banner /></div>

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
              {isLoading || demoLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No companies found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className={cn('hover:bg-muted/20 transition-colors', c.status === 'dissolved' && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground leading-tight">{c.name}</div>
                    {c.notes && <div className="text-[11px] text-amber-600 mt-0.5">{c.notes}</div>}
                    {c.status === 'dissolved' && <Badge variant="outline" className="text-[10px] mt-0.5 border-slate-300 text-slate-500">Dissolved</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.number || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {c.accounts_period ? format(parseISO(c.accounts_period), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.accounts_due ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{format(parseISO(c.accounts_due), 'dd MMM yyyy')}</div>
                        <DaysChip dueDateStr={c.accounts_due} />
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {c.cs_date ? format(parseISO(c.cs_date), 'dd MMM yyyy') : '—'}
                  </td>
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
                    {c.number && (
                      <a
                        href={`https://find-and-update.company-information.service.gov.uk/company/${c.number}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View on Companies House"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Showing {filtered.length} of {enriched.length} companies · Data sourced from your Company records
        </div>
      </div>
    </div>
  );
}