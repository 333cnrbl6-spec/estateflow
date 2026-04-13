import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';

export default function ComplianceAlertsWidget() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState({});

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const pendingAlerts = await base44.entities.CertificateExpiryAlert.filter(
        { status: ['pending', 'sent'] },
        '-days_until_expiry',
        50
      );
      setAlerts(pendingAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (days) => {
    if (days <= 7) return 'border-red-500 bg-red-50';
    if (days <= 14) return 'border-amber-500 bg-amber-50';
    return 'border-blue-500 bg-blue-50';
  };

  const getUrgencyIcon = (days) => {
    if (days <= 7) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (days <= 14) return <AlertCircle className="w-4 h-4 text-amber-600" />;
    return <Clock className="w-4 h-4 text-blue-600" />;
  };

  const getUrgencyBadge = (days) => {
    if (days <= 7) return <Badge className="bg-red-600">CRITICAL</Badge>;
    if (days <= 14) return <Badge className="bg-amber-600">WARNING</Badge>;
    return <Badge variant="outline">Due Soon</Badge>;
  };

  const markAsAcknowledged = async (alertId) => {
    try {
      await base44.entities.CertificateExpiryAlert.update(alertId, {
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: 'current_user',
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const criticalCount = alerts.filter(a => a.days_until_expiry <= 7).length;
  const warningCount = alerts.filter(a => a.days_until_expiry > 7 && a.days_until_expiry <= 14).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading compliance alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Compliance Alerts
          </CardTitle>
          {alerts.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {criticalCount > 0 && <Badge className="bg-red-600">{criticalCount} Critical</Badge>}
              {warningCount > 0 && <Badge className="bg-amber-600">{warningCount} Warning</Badge>}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-slate-700">All Certificates Current</p>
            <p className="text-xs text-muted-foreground mt-1">No certificates expiring within 30 days</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.map(alert => {
              const isExpanded = expandedAlerts[alert.id];
              const expiryDate = new Date(alert.expiry_date);
              const daysUrgency = alert.days_until_expiry <= 7 ? 'CRITICAL' : alert.days_until_expiry <= 14 ? 'WARNING' : 'SOON';

              return (
                <div
                  key={alert.id}
                  className={`border-l-4 rounded-lg p-3 transition-all ${getUrgencyColor(alert.days_until_expiry)} ${
                    isExpanded ? 'ring-2 ring-offset-1 ring-slate-300' : ''
                  }`}
                >
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer"
                    onClick={() =>
                      setExpandedAlerts(prev => ({ ...prev, [alert.id]: !prev[alert.id] }))
                    }
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {getUrgencyIcon(alert.days_until_expiry)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {alert.certificate_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-600">
                          {expiryDate.toLocaleDateString('en-GB')} ({alert.days_until_expiry} days)
                        </p>
                      </div>
                    </div>
                    {getUrgencyBadge(alert.days_until_expiry)}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
                      <div className="text-xs space-y-1">
                        <p>
                          <span className="font-semibold">Property:</span> {alert.property_id}
                        </p>
                        {alert.unit_id && (
                          <p>
                            <span className="font-semibold">Unit:</span> {alert.unit_id}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold">Status:</span>{' '}
                          <span className="capitalize">{alert.status}</span>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsAcknowledged(alert.id)}
                        className="w-full text-xs"
                      >
                        Mark as Acknowledged
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {alerts.length > 0 && (
          <Button
            variant="outline"
            className="w-full text-xs mt-3"
            onClick={() => (window.location.href = '/compliance')}
          >
            View Full Compliance Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
}