import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Clock, CheckCircle2, ChevronDown, ChevronUp, Bell, Loader2, Sparkles, X
} from 'lucide-react';

const COMPLIANCE_TYPES = [
  'gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert', 'asbestos_report'
];

const CERT_LABELS = {
  gas_safety_cert: 'Gas Safety Cert',
  eicr: 'EICR',
  epc: 'EPC',
  fire_safety_cert: 'Fire Safety',
  asbestos_report: 'Asbestos',
};

function urgencyStyle(days) {
  if (days < 0) return { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertTriangle, iconColor: 'text-red-500', label: 'EXPIRED' };
  if (days <= 30) return { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertTriangle, iconColor: 'text-red-500', label: `${days}d` };
  if (days <= 60) return { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: Clock, iconColor: 'text-amber-500', label: `${days}d` };
  return { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: Clock, iconColor: 'text-yellow-500', label: `${days}d` };
}

export default function ComplianceAlertsPanel({ documents, propertyMap }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const today = new Date();

  // Filter compliance docs with expiry in next 90 days or already expired
  const alertDocs = (documents || []).filter(d => {
    if (!COMPLIANCE_TYPES.includes(d.document_type) || !d.expiry_date) return false;
    const days = Math.ceil((new Date(d.expiry_date) - today) / 86400000);
    return days <= 90;
  }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

  const expiredCount = alertDocs.filter(d => new Date(d.expiry_date) < today).length;
  const within30 = alertDocs.filter(d => {
    const days = Math.ceil((new Date(d.expiry_date) - today) / 86400000);
    return days >= 0 && days <= 30;
  }).length;

  const runScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await base44.functions.invoke('checkCertificateExpiry', {});
      setScanResult(res.data);
      qc.invalidateQueries(['tenant-notifications']);
    } finally {
      setScanning(false);
    }
  };

  if (alertDocs.length === 0) return null;

  return (
    <div className={`rounded-xl border-2 ${expiredCount > 0 ? 'border-red-300' : 'border-amber-300'} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-4 py-3 ${expiredCount > 0 ? 'bg-red-50' : 'bg-amber-50'} hover:opacity-90 transition-opacity`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${expiredCount > 0 ? 'text-red-500' : 'text-amber-500'}`} />
          <div className="text-left">
            <p className={`text-sm font-bold ${expiredCount > 0 ? 'text-red-800' : 'text-amber-800'}`}>
              Compliance Certificate Alerts
            </p>
            <p className={`text-xs ${expiredCount > 0 ? 'text-red-600' : 'text-amber-600'}`}>
              {expiredCount > 0 && `${expiredCount} expired · `}
              {within30 > 0 && `${within30} expiring within 30 days · `}
              {alertDocs.length} total alerts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={e => { e.stopPropagation(); runScan(); }} disabled={scanning}
            className="h-7 text-xs gap-1 bg-white border border-current hover:bg-slate-50"
            style={{ color: expiredCount > 0 ? '#b91c1c' : '#92400e' }}>
            {scanning ? <><Loader2 className="w-3 h-3 animate-spin" />Scanning…</> : <><Bell className="w-3 h-3" />Send Alerts</>}
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {/* Scan result banner */}
      {scanResult && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Scan complete — {scanResult.notifications_created} notification{scanResult.notifications_created !== 1 ? 's' : ''} sent · {scanResult.expired} expired · {scanResult.expiring_soon} expiring soon</span>
          </div>
          <button onClick={() => setScanResult(null)}><X className="w-3.5 h-3.5 text-green-600" /></button>
        </div>
      )}

      {/* Alert rows */}
      {expanded && (
        <div className="divide-y bg-white">
          {alertDocs.map(doc => {
            const days = Math.ceil((new Date(doc.expiry_date) - today) / 86400000);
            const s = urgencyStyle(days);
            const Icon = s.icon;
            const property = propertyMap?.[doc.property_id];

            return (
              <div key={doc.id} className={`flex items-center justify-between px-4 py-3 gap-3 ${s.bg}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${s.iconColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {CERT_LABELS[doc.document_type] || doc.document_type}
                      {property && ` · ${property.name}`}
                      {' · '}Expires {doc.expiry_date}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${s.badge}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}