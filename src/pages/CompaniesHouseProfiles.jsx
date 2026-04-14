import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2, FileText, Users, AlertCircle, CheckCircle2, Clock,
  RefreshCw, Loader2, Link as LinkIcon, DollarSign, Activity
} from 'lucide-react';

export default function CompaniesHouseProfiles() {
  const [refreshing, setRefreshing] = useState(new Set());

  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['companies-house-profiles'],
    queryFn: () => base44.entities.CompaniesHouseProfile.list('-last_synced', 100),
  });

  const refreshProfile = async (id, companyNumber) => {
    setRefreshing(prev => new Set([...prev, id]));
    try {
      await base44.functions.invoke('syncCompaniesHouseData', {
        company_number: companyNumber,
        company_name: id
      });
      refetch();
    } finally {
      setRefreshing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'liquidation': 'bg-red-100 text-red-800',
      'dissolved': 'bg-slate-100 text-slate-800',
      'administration': 'bg-orange-100 text-orange-800',
      'converted-closed': 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'critical': <AlertCircle className="w-4 h-4 text-red-600" />,
      'high': <AlertCircle className="w-4 h-4 text-orange-600" />,
      'medium': <Clock className="w-4 h-4 text-yellow-600" />,
      'low': <Activity className="w-4 h-4 text-blue-600" />
    };
    return icons[severity];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Companies House Profiles</h1>
          <p className="text-muted-foreground mt-1">Track registered companies and compliance deadlines</p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh All
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No Companies House profiles yet.</p>
            <p className="text-sm text-muted-foreground">Add companies via the Companies House wizard.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {profiles.map(profile => (
            <Card key={profile.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-bold text-slate-900">{profile.company_name}</h2>
                      <Badge className={getStatusColor(profile.company_status)}>
                        {profile.company_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Company Number: <span className="font-mono font-semibold">{profile.company_number}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshProfile(profile.id, profile.company_number)}
                    disabled={refreshing.has(profile.id)}
                  >
                    {refreshing.has(profile.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold">Incorporation</p>
                    <p className="text-sm font-semibold mt-1">
                      {profile.incorporation_date ? new Date(profile.incorporation_date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold">Type</p>
                    <p className="text-sm font-semibold mt-1 capitalize">{profile.company_type || '—'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold">Directors</p>
                    <p className="text-sm font-semibold mt-1">{profile.directors?.length || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold">Last Synced</p>
                    <p className="text-xs font-semibold mt-1">
                      {new Date(profile.last_synced).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Critical Alerts */}
                {profile.critical_alerts && profile.critical_alerts.length > 0 && (
                  <div className="border-2 border-red-100 bg-red-50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-red-900 flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      Active Alerts ({profile.critical_alerts.length})
                    </h3>
                    <div className="space-y-2">
                      {profile.critical_alerts.map((alert, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-red-200 text-sm">
                          <div className="flex items-start gap-2">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 capitalize">
                                {alert.type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-slate-600 text-xs mt-1">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deadlines */}
                {(profile.accounts_filing_due || profile.confirmation_statement_due) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-amber-900 flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4" />
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-2">
                      {profile.accounts_filing_due && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-amber-100 text-sm">
                          <span className="text-slate-700">Annual Accounts Filing</span>
                          <span className={`font-semibold ${profile.accounts_filing_overdue ? 'text-red-600' : 'text-amber-700'}`}>
                            {new Date(profile.accounts_filing_due).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {profile.confirmation_statement_due && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-amber-100 text-sm">
                          <span className="text-slate-700">Confirmation Statement</span>
                          <span className="font-semibold text-amber-700">
                            {new Date(profile.confirmation_statement_due).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Filings */}
                {profile.filing_history && profile.filing_history.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4" />
                      Recent Filings
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {profile.filing_history.slice(0, 5).map((filing, idx) => (
                        <div key={idx} className="flex items-start justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{filing.description}</p>
                            <p className="text-muted-foreground">{filing.type}</p>
                          </div>
                          <span className="text-slate-500 shrink-0 ml-2">
                            {new Date(filing.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Directors & Officers */}
                {profile.directors && profile.directors.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4" />
                      Directors & Officers ({profile.directors.length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {profile.directors.filter(d => !d.resigned_on).map((director, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                          <p className="font-semibold text-slate-800">{director.name}</p>
                          <p className="text-muted-foreground">{director.role}</p>
                          {director.appointed_on && (
                            <p className="text-xs text-slate-500">Appointed {new Date(director.appointed_on).toLocaleDateString()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}