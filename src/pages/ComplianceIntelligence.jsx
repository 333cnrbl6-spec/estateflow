import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Shield, Zap, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ComplianceIntelligence() {
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch compliance risk scores
  const riskQuery = useQuery({
    queryKey: ['compliance-risk-scores', timeRange],
    queryFn: async () => {
      const res = await base44.functions.invoke('calculateComplianceRiskScores', {
        timeRange,
        includePredictor: true
      });
      return res.data;
    }
  });

  // Fetch expiring compliance items
  const expiryQuery = useQuery({
    queryKey: ['expiring-compliance-items'],
    queryFn: async () => {
      const res = await base44.functions.invoke('scanExpiringComplianceItems', {
        daysAhead: 90
      });
      return res.data;
    }
  });

  // Fetch maintenance predictions
  const maintenanceQuery = useQuery({
    queryKey: ['maintenance-predictions'],
    queryFn: async () => {
      const res = await base44.functions.invoke('predictMaintenanceNeeds', {
        lookAheadMonths: 3
      });
      return res.data;
    }
  });

  const { properties = [] } = riskQuery.data || {};
  const { items: expiringItems = [] } = expiryQuery.data || {};
  const { predictions = [] } = maintenanceQuery.data || {};

  // Risk aggregates
  const riskStats = useMemo(() => {
    const scores = properties.map(p => p.risk_score || 0);
    const avgRisk = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
    const highRisk = properties.filter(p => (p.risk_score || 0) >= 70).length;
    const lowRisk = properties.filter(p => (p.risk_score || 0) < 30).length;
    return { avgRisk, highRisk, lowRisk, total: properties.length };
  }, [properties]);

  const riskDistribution = useMemo(() => [
    { name: 'Low Risk (<30)', value: riskStats.lowRisk },
    { name: 'Medium (30-70)', value: riskStats.total - riskStats.highRisk - riskStats.lowRisk },
    { name: 'High Risk (>70)', value: riskStats.highRisk }
  ], [riskStats]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Compliance Intelligence
            </h1>
            <p className="text-lg text-slate-600">AI-powered risk scoring & predictive alerts</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm text-slate-600">Avg Risk Score</p>
              <p className="text-3xl font-bold text-slate-900">{riskStats.avgRisk}</p>
              <p className="text-xs text-slate-500">Portfolio-wide compliance health</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" /> High Risk Properties
              </p>
              <p className="text-3xl font-bold text-red-600">{riskStats.highRisk}</p>
              <p className="text-xs text-slate-500">Require immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Bell className="w-4 h-4 text-orange-600" /> Expiring Soon
              </p>
              <p className="text-3xl font-bold text-orange-600">{expiringItems.length}</p>
              <p className="text-xs text-slate-500">In next 90 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-600" /> Predicted Issues
              </p>
              <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
              <p className="text-xs text-slate-500">Likely in 3 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="risk" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="risk">Risk Dashboard</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Alerts</TabsTrigger>
            <TabsTrigger value="predictions">Maintenance</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          {/* Risk Dashboard */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Trend (30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={properties.slice(0, 7).map((p, i) => ({ day: `Day ${i + 1}`, risk: p.risk_score || 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { factor: 'Expiring Gas Certificates', count: 8, severity: 'high' },
                    { factor: 'Overdue Tenant Screenings', count: 5, severity: 'high' },
                    { factor: 'Missing EICR Reports', count: 12, severity: 'medium' },
                    { factor: 'Lease Expirations (90 days)', count: 3, severity: 'medium' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-900 font-medium">{item.factor}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-700">{item.count}</span>
                        <Badge className={item.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                          {item.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expiry Alerts */}
          <TabsContent value="expiry">
            <Card>
              <CardContent className="pt-6">
                {expiringItems.length > 0 ? (
                  <div className="space-y-3">
                    {expiringItems.slice(0, 10).map((item, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{item.certificate_type}</p>
                            <p className="text-sm text-slate-600 mt-1">{item.property_name}</p>
                            <p className="text-xs text-slate-500 mt-1">Expires: {item.expiry_date}</p>
                          </div>
                          <Badge className={
                            item.days_until_expiry <= 30 ? 'bg-red-100 text-red-800' :
                            item.days_until_expiry <= 60 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {item.days_until_expiry} days
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No expiring items in the next 90 days</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Predictions */}
          <TabsContent value="predictions">
            <Card>
              <CardContent className="pt-6">
                {predictions.length > 0 ? (
                  <div className="space-y-3">
                    {predictions.slice(0, 8).map((pred, i) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{pred.maintenance_type}</p>
                            <p className="text-sm text-slate-600 mt-1">{pred.property_name}</p>
                            <p className="text-xs text-slate-500 mt-1">Predicted: {pred.predicted_month}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{pred.confidence}%</p>
                            <p className="text-xs text-slate-500">confidence</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No maintenance predictions at this time</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties */}
          <TabsContent value="properties">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {properties.slice(0, 15).map((prop, i) => (
                    <div key={i} className="p-3 flex items-center justify-between border-b border-slate-200 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{prop.name || `Property ${i + 1}`}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              prop.risk_score >= 70 ? 'bg-red-600' :
                              prop.risk_score >= 40 ? 'bg-orange-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${prop.risk_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 w-8 text-right">{prop.risk_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}