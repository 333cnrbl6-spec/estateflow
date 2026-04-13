import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Loader2, CheckCircle2, AlertTriangle, ClipboardList,
  Bell, ChevronDown, ChevronUp, X, Shield
} from 'lucide-react';

const GAP_STYLES = {
  missing:  { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'Missing' },
  expired:  { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, iconColor: 'text-red-600', badge: 'Expired' },
  expiring: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', badge: 'Expiring' },
};

export default function ComplianceGapAudit() {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const runAudit = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('auditComplianceGaps', {});
      setResult(res.data);
      qc.invalidateQueries(['maintenance']);
      qc.invalidateQueries(['tenant-notifications']);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const missingCount = result?.gaps?.filter(g => g.gap_type === 'missing').length || 0;
  const expiredCount = result?.gaps?.filter(g => g.gap_type === 'expired').length || 0;
  const expiringCount = result?.gaps?.filter(g => g.gap_type === 'expiring').length || 0;

  return (
    <div className="rounded-xl border-2 border-primary/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">AI Compliance Gap Audit</p>
            <p className="text-xs text-muted-foreground">
              {result
                ? `${result.properties_audited} properties checked · ${result.gaps_found} gap${result.gaps_found !== 1 ? 's' : ''} found`
                : 'Scan all properties for missing or expired Gas Safety, EICR, EPC and Fire Safety certificates'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!result ? (
            <Button onClick={runAudit} disabled={running} className="gap-2 h-8 text-sm">
              {running
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Auditing…</>
                : <><Sparkles className="w-3.5 h-3.5" />Run Audit</>}
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={runAudit} disabled={running} className="h-7 text-xs gap-1">
                {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}Re-run
              </Button>
              <button onClick={() => setResult(null)}><X className="w-4 h-4 text-muted-foreground hover:text-slate-700" /></button>
            </>
          )}
          {result && (
            <button onClick={() => setExpanded(e => !e)}>
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          )}
        </div>
      </div>

      {/* Summary pills */}
      {result && (
        <div className="flex flex-wrap gap-3 px-5 py-3 bg-white border-b">
          {[
            { label: 'Properties Audited', value: result.properties_audited, color: 'text-slate-700' },
            { label: 'Gaps Found', value: result.gaps_found, color: result.gaps_found > 0 ? 'text-red-600' : 'text-green-600' },
            { label: 'Tasks Created', value: result.tasks_created, color: 'text-primary', icon: ClipboardList },
            { label: 'Alerts Sent', value: result.notifications_sent, color: 'text-primary', icon: Bell },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              {s.icon && <s.icon className={`w-3.5 h-3.5 ${s.color}`} />}
              <span className={`font-bold text-base ${s.color}`}>{s.value}</span>
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}

          {result.gaps_found === 0 && (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">All compliance documents are present and valid</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="px-5 py-3 bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />{error}
        </div>
      )}

      {/* Gap list */}
      {result && expanded && result.gaps?.length > 0 && (
        <div className="divide-y bg-white max-h-72 overflow-y-auto">
          {result.gaps.map((gap, i) => {
            const s = GAP_STYLES[gap.gap_type] || GAP_STYLES.missing;
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center justify-between px-5 py-3 gap-3 hover:bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${s.iconColor}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{gap.property}</p>
                    <p className="text-xs text-muted-foreground">{gap.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {gap.task_created && (
                    <span className="text-xs text-primary flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />Task created
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.color}`}>
                    {s.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}