import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react';

export default function CertificateExpiryAlerts({ certificates, propertyMap }) {
  const alerts = useMemo(() => {
    const now = new Date();
    const alertList = [];

    certificates?.forEach(cert => {
      if (!cert.expiry_date) return;
      const expiryDate = new Date(cert.expiry_date);
      const daysUntil = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntil < 90) { // Show alerts for upcoming, soon, and overdue
        alertList.push({
          ...cert,
          daysUntil,
          severity: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'urgent' : daysUntil <= 30 ? 'warning' : 'info',
          propertyName: propertyMap?.[cert.property_id]?.name || 'Unknown Property',
        });
      }
    });

    return alertList.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [certificates, propertyMap]);

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertTriangle };
      case 'urgent':
        return { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
      case 'warning':
        return { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: Clock };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: AlertCircle };
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificate Expiry Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">All certificates are valid. No alerts at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Expiry Alerts ({alerts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;
            const certType = alert.certificate_number ? 'Gas Safety' : 'EICR'; // Simplified - could add more types

            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: config.badge.split(' ')[0].replace('bg-', '') }} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{alert.propertyName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{certType} Certificate</p>
                      <p className="text-xs font-mono text-muted-foreground">Ref: {alert.certificate_number || alert.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={config.badge}>
                      {alert.daysUntil < 0
                        ? `${Math.abs(alert.daysUntil)} days overdue`
                        : `${alert.daysUntil} days left`}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Expires: {new Date(alert.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}