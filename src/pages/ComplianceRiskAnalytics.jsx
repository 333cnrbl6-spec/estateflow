import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';

const RISK_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#eab308',
  low: '#16a34a'
};

function RiskBadge({ level }) {
  const colors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export default function ComplianceRiskAnalytics() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    loadRiskScores();
  }, []);

  const loadRiskScores = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('calculateComplianceRiskScores', {});
      setScores(response.data?.scores || []);
    } catch (error) {
      console.error('Error loading risk scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterLevel === 'all' 
    ? scores 
    : scores.filter(s => s.risk_level === filterLevel);

  const property = selectedProperty 
    ? filtered.find(p => p.property_id === selectedProperty)
    : filtered[0];

  const stats = {
    critical: scores.filter(s => s.risk_level === 'critical').length,
    high: scores.filter(s => s.risk_level === 'high').length,
    medium: scores.filter(s => s.risk_level === 'medium').length,
    low: scores.filter(s => s.risk_level === 'low').length,
  };

  const riskDistribution = [
    { name: 'Critical', value: stats.critical, fill: RISK_COLORS.critical },
    { name: 'High', value: stats.high, fill: RISK_COLORS.high },
    { name: 'Medium', value: stats.medium, fill: RISK_COLORS.medium },
    { name: 'Low', value: stats.low, fill: RISK_COLORS.low },
  ];

  const topRisks = [...scores]
    .sort((a, b) => b.overall_risk_score - a.overall_risk_score)
    .slice(0, 10)
    .map(s => ({
      name: s.property_name.substring(0, 20),
      score: s.overall_risk_score,
      certificates: s.certificate_risk_score,
      remedial: s.remedial_risk_score,
      incidents: s.incident_risk_score
    }));

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Compliance Risk Analytics"
        subtitle="Predictive risk scoring by certificate expiry, incidents, and remedial actions"
      >
        <Button onClick={loadRiskScores} disabled={loading} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Recalculate Scores
        </Button>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Critical Risk', value: stats.critical, color: 'red' },
          { label: 'High Risk', value: stats.high, color: 'orange' },
          { label: 'Medium Risk', value: stats.medium, color: 'yellow' },
          { label: 'Low Risk', value: stats.low, color: 'green' }
        ].map(stat => (
          <div key={stat.label} className={`rounded-lg border-2 p-4 bg-${stat.color}-50 dark:bg-${stat.color}-950 border-${stat.color}-200 dark:border-${stat.color}-800`}>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="detail">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="currentColor">
                    {riskDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Risk Factors */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Risk Component Breakdown (Average)</h3>
              <div className="space-y-3">
                {[
                  { label: 'Certificate Expiry', value: Math.round(scores.reduce((s, p) => s + p.certificate_risk_score, 0) / scores.length || 0), icon: Clock },
                  { label: 'Remedial Actions', value: Math.round(scores.reduce((s, p) => s + p.remedial_risk_score, 0) / scores.length || 0), icon: AlertCircle },
                  { label: 'Incidents', value: Math.round(scores.reduce((s, p) => s + p.incident_risk_score, 0) / scores.length || 0), icon: AlertTriangle },
                  { label: 'License Renewal', value: Math.round(scores.reduce((s, p) => s + p.license_risk_score, 0) / scores.length || 0), icon: Clock }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {React.createElement(item.icon, { className: 'w-4 h-4 text-primary' })}
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Risk Properties */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Properties by Risk Score</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRisks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#221f3b" name="Overall Score" />
                <Bar dataKey="certificates" fill="#ea580c" name="Certificates" />
                <Bar dataKey="remedial" fill="#eab308" name="Remedial" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6 mt-6">
          <div className="flex gap-3 mb-4">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="space-y-3">
            {filtered.map(prop => (
              <div
                key={prop.property_id}
                onClick={() => setSelectedProperty(prop.property_id)}
                className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedProperty === prop.property_id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${
                  prop.risk_level === 'critical' ? 'bg-red-50 dark:bg-red-950' :
                  prop.risk_level === 'high' ? 'bg-orange-50 dark:bg-orange-950' :
                  prop.risk_level === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950' :
                  'bg-green-50 dark:bg-green-950'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{prop.property_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Calculated: {new Date(prop.calculated_date).toLocaleDateString()}</p>
                  </div>
                  <RiskBadge level={prop.risk_level} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-xs">
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="text-muted-foreground mb-0.5">Score</p>
                    <p className="font-bold text-lg">{prop.overall_risk_score}</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="text-muted-foreground mb-0.5">Certificates</p>
                    <p className="font-bold">{prop.certificate_risk_score}%</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="text-muted-foreground mb-0.5">Remedial</p>
                    <p className="font-bold">{prop.remedial_risk_score}%</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="text-muted-foreground mb-0.5">Incidents</p>
                    <p className="font-bold">{prop.incident_risk_score}%</p>
                  </div>
                  <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                    <p className="text-muted-foreground mb-0.5">At Risk Items</p>
                    <p className="font-bold">{(prop.certificates_at_risk?.length || 0) + (prop.outstanding_actions?.length || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Detail Tab */}
        <TabsContent value="detail" className="space-y-6 mt-6">
          {property ? (
            <div className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{property.property_name}</h3>
                
                {/* Recommendations */}
                {property.priority_recommendations?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Priority Recommendations</h4>
                    <div className="space-y-2">
                      {property.priority_recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          {rec.urgency === 'immediate' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                          {rec.urgency === 'urgent' && <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />}
                          {rec.urgency === 'important' && <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />}
                          {rec.urgency === 'routine' && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
                          <div>
                            <p className="text-sm font-medium text-foreground">{rec.recommendation}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.category.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates at Risk */}
                {property.certificates_at_risk?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Certificates Expiring Soon</h4>
                    <div className="space-y-2">
                      {property.certificates_at_risk.map((cert, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded">
                          <div>
                            <p className="font-medium text-foreground capitalize">{cert.certificate_type.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-muted-foreground">Expires: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                          </div>
                          <span className="text-sm font-bold text-orange-700 dark:text-orange-200">{cert.days_until_expiry}d</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outstanding Actions */}
                {property.outstanding_actions?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Outstanding Remedial Actions</h4>
                    <div className="space-y-2">
                      {property.outstanding_actions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{action.action_description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-white/50 rounded capitalize">{action.priority}</span>
                              {action.days_overdue > 0 && <span className="text-xs text-red-600 font-semibold">{action.days_overdue}d overdue</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* License Info */}
                {property.licenses_expiring?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">License Renewals</h4>
                    <div className="space-y-2">
                      {property.licenses_expiring.map((lic, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                          <p className="font-medium text-foreground">{lic.license_type} License</p>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-200">{lic.days_until_expiry}d</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">Select a property to view details</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}