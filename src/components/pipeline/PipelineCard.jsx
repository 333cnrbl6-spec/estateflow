import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle, MapPin, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

const TODAY = new Date();

function getCertAlerts(record) {
  const alerts = [];
  const certs = [
    { key: 'gas_safety_expiry_date', label: 'Gas Safety' },
    { key: 'eicr_expiry_date', label: 'EICR' },
    { key: 'epc_expiry_date', label: 'EPC' },
    { key: 'hmo_licence_expiry', label: 'HMO Licence' },
    { key: 'next_periodic_inspection_date', label: 'Inspection Due' },
  ];
  certs.forEach(({ key, label }) => {
    if (record[key]) {
      const days = differenceInDays(parseISO(record[key]), TODAY);
      if (days < 0) alerts.push({ label, days, overdue: true });
      else if (days <= 30) alerts.push({ label, days, overdue: false });
    }
  });
  return alerts;
}

export default function PipelineCard({ record, onClick }) {
  const alerts = getCertAlerts(record);
  const hasAlerts = alerts.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-all cursor-pointer',
        hasAlerts ? 'border-amber-300 bg-amber-50/40' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-xs font-semibold text-foreground leading-tight line-clamp-2 flex-1">
          {record.unit_reference ? `${record.unit_reference}, ` : ''}{record.property_address}
        </span>
        {record.jurisdiction === 'wales' && (
          <span title="Wales — Renting Homes Act applies" className="shrink-0 text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 rounded px-1">W</span>
        )}
      </div>

      {record.applicant_name && (
        <p className="text-[11px] text-muted-foreground mb-1.5">{record.applicant_name}</p>
      )}

      {record.monthly_rent && (
        <p className="text-[11px] font-medium text-primary">£{record.monthly_rent.toLocaleString()}/mo</p>
      )}

      {record.reference && (
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">{record.reference}</p>
      )}

      {hasAlerts && (
        <div className="mt-2 space-y-0.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span className="text-[10px] text-amber-700">
                {a.label} {a.overdue ? `${Math.abs(a.days)}d overdue` : `exp. ${a.days}d`}
              </span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}