import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Building2, Users, FileText, Loader2, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CompaniesHouseAlertWidget({ limit = 5 }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.CompaniesHouseProfile.list('-last_synced', 50);
      
      // Filter to only those with active alerts
      const withAlerts = data.filter(p => p.critical_alerts && p.critical_alerts.length > 0);
      setProfiles(withAlerts.slice(0, limit));
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncProfile = async (profileId, companyNumber) => {
    setSyncing(prev => ({ ...prev, [profileId]: true }));
    try {
      await base44.functions.invoke('syncCompaniesHouseData', {
        company_number: companyNumber,
        company_name: profileId
      });
      await loadProfiles();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(prev => ({ ...prev, [profileId]: false }));
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      'accounts_overdue': AlertCircle,
      'confirmation_statement_due': Clock,
      'director_change': Users,
      'status_change': AlertTriangle,
      'strike_off_notice': AlertCircle,
      'insolvency': AlertCircle
    };
    return icons[type] || AlertCircle;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'bg-red-50 border-red-200 text-red-700',
      'high': 'bg-orange-50 border-orange-200 text-orange-700',
      'medium': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      'low': 'bg-blue-50 border-blue-200 text-blue-700'
    };
    return colors[severity] || colors.low;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Companies House Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Companies House Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm">No active alerts. All registered companies are compliant.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Companies House Alerts ({profiles.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadProfiles}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profiles.map(profile => (
          <div key={profile.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">{profile.company_name}</h3>
                <p className="text-xs text-muted-foreground">{profile.company_number}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => syncProfile(profile.id, profile.company_number)}
                disabled={syncing[profile.id]}
                className="text-xs"
              >
                {syncing[profile.id] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {profile.critical_alerts.slice(0, 3).map((alert, idx) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div key={idx} className={`p-3 rounded-md border flex items-start gap-2 ${getSeverityColor(alert.severity)}`}>
                    <AlertIcon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold capitalize">{alert.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
              {profile.critical_alerts.length > 3 && (
                <p className="text-xs text-muted-foreground">+{profile.critical_alerts.length - 3} more alerts</p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Last synced: {new Date(profile.last_synced).toLocaleDateString()}</span>
              {profile.sync_error && <span className="text-red-600">Sync error</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}