import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Bell, ChevronRight, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CERT_TYPE_LABELS = {
  gas_safety: 'Gas Safety',
  eicr: 'Electrical (EICR)',
  fire_safety: 'Fire Safety',
  asbestos: 'Asbestos',
  legionella: 'Legionella',
  pat_testing: 'PAT Testing',
  boiler_service: 'Boiler Service',
  lift_safety: 'Lift Safety',
  other: 'Other',
};

export default function ComplianceAlertsWidget() {
  const { data: alerts = [] } = useQuery({
    queryKey: ['certificate-expiry-alerts'],
    queryFn: () => base44.entities.CertificateExpiryAlert.list('-created_date', 50),
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['alert-configs-widget'],
    queryFn: () => base44.entities.ComplianceAlertConfig.list(),
  });

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
  
  const hasConfiguredAlerts = configs.length > 0 && configs.some(c => c.enabled);

  // Group by urgency
  const urgent = pendingAlerts.filter(a => a.days_until_expiry <= 7);
  const warning = pendingAlerts.filter(a => a.days_until_expiry > 7 && a.days_until_expiry <= 30);
  const upcoming = pendingAlerts.filter(a => a.days_until_expiry > 30);

  if (!hasConfiguredAlerts && pendingAlerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Certificate Expiry Alerts</h3>
            <p className="text-xs text-muted-foreground">
              {pendingAlerts.length} pending · {acknowledgedAlerts.length} acknowledged
            </p>
          </div>
        </div>
        <Link to="/certificate-compliance">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {!hasConfiguredAlerts ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-800 font-medium mb-1">No alert configuration</p>
          <p className="text-blue-700 text-xs mb-2">Set up automated alerts for certificate expiries</p>
          <Link to="/certificate-compliance">
            <Button size="sm" className="text-xs">
              Configure Alerts
            </Button>
          </Link>
        </div>
      ) : pendingAlerts.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">All certificates up to date</span>
          </div>
          <p className="text-emerald-600 text-xs mt-1">No pending expiry alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {urgent.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-700">Critical ({urgent.length})</span>
              </div>
              <div className="space-y-1.5">
                {urgent.slice(0, 3).map(alert => (
                  <AlertItem key={alert.id} alert={alert} urgency="critical" />
                ))}
              </div>
            </div>
          )}

          {warning.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Warning ({warning.length})</span>
              </div>
              <div className="space-y-1.5">
                {warning.slice(0, 3).map(alert => (
                  <AlertItem key={alert.id} alert={alert} urgency="warning" />
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Upcoming ({upcoming.length})</span>
              </div>
              <div className="space-y-1.5">
                {upcoming.slice(0, 2).map(alert => (
                  <AlertItem key={alert.id} alert={alert} urgency="info" />
                ))}
              </div>
            </div>
          )}

          {pendingAlerts.length > 3 && (
            <Link to="/certificate-compliance">
              <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                View All {pendingAlerts.length} Alerts
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert, urgency }) {
  const urgencyStyles = {
    critical: 'bg-red-50 border-red-200 hover:bg-red-100',
    warning: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    info: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  };

  const badgeStyles = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg border text-xs transition-colors",
      urgencyStyles[urgency]
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium truncate">
            {CERT_TYPE_LABELS[alert.certificate_type] || alert.certificate_type}
          </span>
          <Badge className={cn("text-[10px]", badgeStyles[urgency])}>
            {alert.days_until_expiry}d
          </Badge>
        </div>
        <p className="text-muted-foreground text-[11px]">
          Expires: {format(parseISO(alert.expiry_date), 'dd MMM yyyy')}
        </p>
      </div>
      <Link to="/certificate-compliance">
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <ChevronRight className="w-3 h-3" />
        </Button>
      </Link>
    </div>
  );
}