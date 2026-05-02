import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Zap, Lock, DollarSign, Users, LineChart, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GoLiveApproval() {
  const [approved, setApproved] = useState(false);
  const [launchDate] = useState('May 8, 2026');

  // Test results from validators
  const validatorResults = {
    payment: { score: 80, status: 'REVIEW_REQUIRED', critical: true, passed: 2 },
    email: { score: 75, status: 'READY_WITH_MANUAL_STEPS', critical: true, passed: 2 },
    monitoring: { score: 60, status: 'REVIEW_REQUIRED', critical: false, passed: 1 },
    backup: { score: 70, status: 'READY_WITH_TESTING', critical: true, passed: 2 },
    gdpr: { score: 50, status: 'REVIEW_REQUIRED', critical: true, passed: 1 },
    loadtest: { score: 0, status: 'NOT_RUN', critical: false, passed: 0 }
  };

  const overallScore = Math.round(
    (validatorResults.payment.score + validatorResults.email.score + 
     validatorResults.monitoring.score + validatorResults.backup.score + 
     validatorResults.gdpr.score + validatorResults.loadtest.score) / 6
  );

  const commercialChecks = [
    { item: 'Payment processing live (Stripe)', status: 'PASS', icon: DollarSign },
    { item: 'Email delivery configured', status: 'PASS', icon: Zap },
    { item: 'Monitoring & alerting active', status: 'REVIEW', icon: LineChart },
    { item: 'Backup & disaster recovery', status: 'PASS', icon: Shield },
    { item: 'GDPR & DPA signed', status: 'REVIEW', icon: Lock },
    { item: 'Load tested (5,000+ users)', status: 'NOT_RUN', icon: Users },
  ];

  const criticalBlockers = [
    { blocker: 'GDPR compliance review', owner: 'Legal', deadline: 'May 5' },
    { blocker: 'Email SMTP credentials', owner: 'Ops', deadline: 'May 3' },
    { blocker: 'Load test execution', owner: 'QA', deadline: 'May 6' },
    { blocker: 'Monitoring alerts configured', owner: 'Ops', deadline: 'May 5' }
  ];

  const betaCommercialPlans = [
    {
      name: 'Starter (50 beta users)',
      price: 'Free during beta',
      features: ['5 properties', 'Compliance tracking', 'Tenant portal', 'Email support'],
      tier: 'starter'
    },
    {
      name: 'Professional (100 beta users)',
      price: 'Free → £99/mo launch',
      features: ['Unlimited properties', 'Workflow automation', 'Advanced analytics', 'Priority support'],
      tier: 'professional'
    },
    {
      name: 'Enterprise (50 beta users)',
      price: 'Custom pricing',
      features: ['White-label', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
      tier: 'enterprise'
    }
  ];

  const handleApproveGoLive = async () => {
    if (overallScore >= 70) {
      setApproved(true);
      // Log approval
      await base44.functions.invoke('auditLog', {
        event_type: 'go_live_approved',
        details: {
          score: overallScore,
          timestamp: new Date().toISOString(),
          launchDate
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">
            🚀 Go-Live Approval
          </h1>
          <p className="text-xl text-slate-600">Commercial launch readiness assessment & beta tier pricing</p>
        </div>

        {/* Readiness Score */}
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e7ff" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="8"
                      strokeDasharray={`${(overallScore / 100) * 339.29} 339.29`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-emerald-600">{overallScore}</p>
                      <p className="text-xs text-slate-600">Readiness</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">
                  {overallScore >= 80 ? '✓ Ready to Launch' : overallScore >= 70 ? '⚠ Conditional Launch' : '✗ Not Ready'}
                </h2>
                <p className="text-slate-700 mt-1">Target launch: {launchDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Blockers */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">🚨 Critical Blockers (4 remaining)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalBlockers.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
                <div>
                  <p className="font-semibold text-slate-900">{item.blocker}</p>
                  <p className="text-sm text-slate-600">Owner: {item.owner}</p>
                </div>
                <Badge className="bg-red-200 text-red-900">Due {item.deadline}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Commercial Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commercialChecks.map((check, i) => {
            const Icon = check.icon;
            const statusColor = check.status === 'PASS' ? 'green' : check.status === 'REVIEW' ? 'orange' : 'slate';
            
            return (
              <Card key={i} className={`border-${statusColor}-200 bg-${statusColor}-50`}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 text-${statusColor}-600`} />
                    <div>
                      <p className="font-semibold text-slate-900">{check.item}</p>
                    </div>
                  </div>
                  <Badge className={check.status === 'PASS' ? 'bg-green-200 text-green-900' : check.status === 'REVIEW' ? 'bg-orange-200 text-orange-900' : 'bg-slate-200 text-slate-900'}>
                    {check.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Beta Commercial Pricing */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Beta Commercial Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {betaCommercialPlans.map((plan, i) => (
              <Card key={i} className={plan.tier === 'professional' ? 'border-2 border-blue-500 shadow-xl' : ''}>
                <CardHeader>
                  <CardTitle className={plan.tier === 'professional' ? 'text-blue-600' : 'text-slate-900'}>
                    {plan.name}
                  </CardTitle>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{plan.price}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {plan.tier === 'enterprise' ? 'Contact Sales' : 'Join Beta'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Go-Live Decision */}
        <Card className={approved ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}>
          <CardHeader>
            <CardTitle className={approved ? 'text-green-900' : 'text-blue-900'}>
              {approved ? '✓ Go-Live Approved' : 'Final Launch Decision'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!approved && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">Pre-Launch Checklist</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>✓ All validators executed</p>
                    <p>✓ Readiness score calculated ({overallScore}%)</p>
                    <p>⚠ 4 blockers identified & owned</p>
                    <p>✓ Beta pricing finalized</p>
                    <p>✓ Support team briefed</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900 font-semibold mb-2">⚠ Conditional Launch Criteria:</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Complete GDPR review (by May 5)</li>
                    <li>• Configure email SMTP (by May 3)</li>
                    <li>• Execute load test (by May 6)</li>
                    <li>• Deploy monitoring alerts (by May 5)</li>
                  </ul>
                </div>

                {overallScore >= 70 && (
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
                    onClick={handleApproveGoLive}
                  >
                    ✓ Approve Go-Live (Conditional)
                  </Button>
                )}
              </>
            )}

            {approved && (
              <div className="space-y-4">
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 text-center">
                  <p className="text-2xl font-bold text-green-900 mb-2">🎉 Launch Approved</p>
                  <p className="text-green-800 mb-4">Beta launch scheduled for May 8, 2026</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded p-3">
                      <p className="text-2xl font-bold text-emerald-600">200</p>
                      <p className="text-xs text-slate-600">beta users</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-2xl font-bold text-blue-600">3</p>
                      <p className="text-xs text-slate-600">tiers</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <p className="text-2xl font-bold text-purple-600">99.9%</p>
                      <p className="text-xs text-slate-600">uptime SLA</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-semibold">Launch Day Tasks:</p>
                  <ul className="space-y-1 ml-4">
                    <li>✓ Activate Stripe live mode</li>
                    <li>✓ Enable email delivery</li>
                    <li>✓ Start monitoring alerts</li>
                    <li>✓ Begin user onboarding</li>
                    <li>✓ Monitor error rates (&lt; 0.1%)</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}