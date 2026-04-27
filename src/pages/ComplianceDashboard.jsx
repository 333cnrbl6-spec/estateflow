import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, FileText, Home, Shield, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

function StatusPill({ status }) {
  const cfg = {
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
  };
  const labels = { red: '⚠ Action Required', amber: '⏰ Due Soon', green: '✓ Compliant' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg[status]}`}>{labels[status]}</span>;
}

function ComplianceSection({ title, icon: SectionIcon, items, onResolve, resolvingId }) {
  const Icon = SectionIcon;
  if (items.length === 0) return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4" />{title}
          <Badge className="bg-green-100 text-green-700 ml-auto">All Clear</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> No issues found</p>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4 text-red-500" />{title}
          <Badge className="bg-red-100 text-red-700 ml-auto">{items.length} issue{items.length !== 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.label}</p>
                {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <StatusPill status={item.status} />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={resolvingId === item.id}
                  onClick={() => onResolve(item)}
                >
                  {resolvingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mark Resolved'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComplianceDashboard() {
  const qc = useQueryClient();
  const [resolvingId, setResolvingId] = useState(null);
  const today = new Date();

  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['properties-compliance'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-compliance'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: gasCerts = [] } = useQuery({
    queryKey: ['gas-certs'],
    queryFn: () => base44.entities.GasSafetyCertificate?.list?.() || Promise.resolve([]),
  });

  const { data: epcCerts = [] } = useQuery({
    queryKey: ['epc-certs'],
    queryFn: () => base44.entities.EnergyPerformanceCertificate?.list?.() || Promise.resolve([]),
  });

  const { data: deposits = [] } = useQuery({
    queryKey: ['deposits-compliance'],
    queryFn: () => base44.entities.DepositProtection?.list?.() || Promise.resolve([]),
  });

  const { data: hmoLicenses = [] } = useQuery({
    queryKey: ['hmo-licenses'],
    queryFn: () => base44.entities.HMOLicense?.list?.() || Promise.resolve([]),
  });

  const { data: rtrChecks = [] } = useQuery({
    queryKey: ['rtr-checks'],
    queryFn: () => base44.entities.RightToRentCheck?.list?.() || Promise.resolve([]),
  });

  // Build issues arrays
  const gasSafetyIssues = properties.map(p => {
    const cert = gasCerts.find(c => c.property_id === p.id);
    if (!cert) return { id: `gas-${p.id}`, label: p.name || p.address_line_1, detail: 'No gas safety certificate on record', status: 'red', type: 'gas', entity_id: p.id };
    const days = differenceInDays(new Date(cert.expiry_date), today);
    if (days < 0) return { id: `gas-exp-${p.id}`, label: p.name || p.address_line_1, detail: `Expired ${Math.abs(days)} days ago`, status: 'red', type: 'gas', entity_id: cert.id, isUpdate: true };
    if (days <= 30) return { id: `gas-due-${p.id}`, label: p.name || p.address_line_1, detail: `Expires in ${days} days`, status: 'amber', type: 'gas', entity_id: cert.id, isUpdate: true };
    return null;
  }).filter(Boolean);

  const epcIssues = properties.map(p => {
    const cert = epcCerts.find(c => c.property_id === p.id);
    if (!cert) return { id: `epc-${p.id}`, label: p.name || p.address_line_1, detail: 'No EPC on record', status: 'red', type: 'epc', entity_id: p.id };
    const rating = cert.rating || cert.epc_rating;
    if (['F', 'G'].includes(rating)) return { id: `epc-low-${p.id}`, label: p.name || p.address_line_1, detail: `EPC rating ${rating} — below legal minimum E`, status: 'red', type: 'epc', entity_id: cert.id, isUpdate: true };
    const days = cert.expiry_date ? differenceInDays(new Date(cert.expiry_date), today) : 999;
    if (days < 0) return { id: `epc-exp-${p.id}`, label: p.name || p.address_line_1, detail: `EPC expired ${Math.abs(days)} days ago`, status: 'red', type: 'epc', entity_id: cert.id, isUpdate: true };
    return null;
  }).filter(Boolean);

  const depositIssues = tenants.filter(t => t.status === 'active' && t.tenancy_start_date).map(t => {
    const dep = deposits.find(d => d.tenant_id === t.id);
    const daysSince = differenceInDays(today, new Date(t.tenancy_start_date));
    if (!dep || dep.status === 'not_protected') {
      if (daysSince > 30) return { id: `dep-${t.id}`, label: t.full_name, detail: `Deposit unprotected — ${daysSince} days since tenancy start. Legal action possible.`, status: 'red', type: 'deposit', entity_id: t.id };
      if (daysSince > 0) return { id: `dep-${t.id}`, label: t.full_name, detail: `${30 - daysSince} days remaining to protect deposit`, status: 'amber', type: 'deposit', entity_id: t.id };
    }
    return null;
  }).filter(Boolean);

  const hmoIssues = hmoLicenses.filter(l => {
    if (!l.expiry_date) return false;
    const days = differenceInDays(new Date(l.expiry_date), today);
    return days < 60;
  }).map(l => ({
    id: `hmo-${l.id}`,
    label: l.property_name || l.property_id,
    detail: `HMO licence expires in ${differenceInDays(new Date(l.expiry_date), today)} days`,
    status: differenceInDays(new Date(l.expiry_date), today) < 0 ? 'red' : 'amber',
    type: 'hmo',
    entity_id: l.id,
    isUpdate: true,
  }));

  const rtrIssues = rtrChecks.filter(r => {
    if (!r.next_check_due) return false;
    const days = differenceInDays(new Date(r.next_check_due), today);
    return days <= 30;
  }).map(r => ({
    id: `rtr-${r.id}`,
    label: r.tenant_name || r.tenant_id,
    detail: `Right to rent re-check due in ${differenceInDays(new Date(r.next_check_due), today)} days`,
    status: differenceInDays(new Date(r.next_check_due), today) < 0 ? 'red' : 'amber',
    type: 'rtr',
    entity_id: r.id,
    isUpdate: true,
  }));

  const totalIssues = gasSafetyIssues.length + epcIssues.length + depositIssues.length + hmoIssues.length + rtrIssues.length;
  const criticalIssues = [...gasSafetyIssues, ...epcIssues, ...depositIssues, ...hmoIssues, ...rtrIssues].filter(i => i.status === 'red').length;

  const handleResolve = async (item) => {
    setResolvingId(item.id);
    try {
      // Mark as resolved by updating status
      if (item.isUpdate) {
        // Just invalidate to refresh — the user resolves this manually externally
        toast.success('Marked as reviewed — remember to upload updated certificate');
      } else {
        toast.info('Navigate to the record to upload the required document');
      }
      qc.invalidateQueries();
    } finally {
      setResolvingId(null);
    }
  };

  const isLoading = loadingProps;

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${totalIssues === 0 ? 'border-l-green-500' : criticalIssues > 0 ? 'border-l-red-500' : 'border-l-amber-500'}`}>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Issues</p>
            <p className="text-3xl font-bold">{totalIssues}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-3xl font-bold text-red-600">{criticalIssues}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Due Soon</p>
            <p className="text-3xl font-bold text-amber-600">{totalIssues - criticalIssues}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Properties</p>
            <p className="text-3xl font-bold text-green-600">{properties.length}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <ComplianceSection title="Gas Safety Certificates" icon={Shield} items={gasSafetyIssues} onResolve={handleResolve} resolvingId={resolvingId} />
      <ComplianceSection title="Energy Performance Certificates (EPC)" icon={FileText} items={epcIssues} onResolve={handleResolve} resolvingId={resolvingId} />
      <ComplianceSection title="Deposit Protection" icon={Home} items={depositIssues} onResolve={handleResolve} resolvingId={resolvingId} />
      <ComplianceSection title="HMO Licence Renewals" icon={Clock} items={hmoIssues} onResolve={handleResolve} resolvingId={resolvingId} />
      <ComplianceSection title="Right to Rent Checks" icon={AlertTriangle} items={rtrIssues} onResolve={handleResolve} resolvingId={resolvingId} />
    </div>
  );
}