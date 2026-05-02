import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PreLaunchValidation() {
  const [validations, setValidations] = useState({});
  const [loading, setLoading] = useState({});

  const validators = [
    { id: 'payment', name: 'Payment Pipeline', fn: 'verifyPaymentPipeline' },
    { id: 'email', name: 'Email Delivery', fn: 'verifyEmailDelivery' },
    { id: 'monitoring', name: 'Monitoring Setup', fn: 'verifyMonitoringSetup' },
    { id: 'backup', name: 'Backup & Recovery', fn: 'verifyBackupRecovery' },
    { id: 'gdpr', name: 'GDPR Compliance', fn: 'verifyGDPRCompliance' },
    { id: 'loadtest', name: 'Load Testing', fn: 'loadTestValidator' }
  ];

  const runValidation = async (id, fn) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const result = await base44.functions.invoke(fn, {});
      setValidations(prev => ({ ...prev, [id]: result.data }));
    } catch (error) {
      setValidations(prev => ({ ...prev, [id]: { error: error.message, status: 'FAILED' } }));
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'PASS' || status === 'READY' || status === 'CONFIGURED') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'REVIEW' || status === 'READY_WITH_CONFIGURATION' || status === 'REVIEW_REQUIRED') return <AlertCircle className="w-5 h-5 text-orange-600" />;
    if (status === 'FAILED') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-slate-400" />;
  };

  const overallStatus = Object.values(validations).every(v => !v.error && (v.overallStatus === 'READY' || v.status === 'CONFIGURED'))
    ? 'LAUNCH_READY'
    : Object.values(validations).some(v => v.error || v.overallStatus === 'FAILED')
    ? 'CRITICAL_ISSUES'
    : 'ACTION_REQUIRED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🚀 Pre-Launch Validation</h1>
          <p className="text-lg text-slate-600">Run all 7 pre-launch checks before going live</p>
        </div>

        {/* Overall Status */}
        <Card className={overallStatus === 'LAUNCH_READY' ? 'border-green-200 bg-green-50' : overallStatus === 'CRITICAL_ISSUES' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-xl font-bold ${overallStatus === 'LAUNCH_READY' ? 'text-green-900' : overallStatus === 'CRITICAL_ISSUES' ? 'text-red-900' : 'text-orange-900'}`}>
                Overall Status: {overallStatus}
              </h2>
              {overallStatus === 'LAUNCH_READY' && <Badge className="bg-green-600">READY TO LAUNCH</Badge>}
              {overallStatus === 'CRITICAL_ISSUES' && <Badge className="bg-red-600">CRITICAL ISSUES</Badge>}
              {overallStatus === 'ACTION_REQUIRED' && <Badge className="bg-orange-600">ACTION REQUIRED</Badge>}
            </div>
            <p className={`text-sm ${overallStatus === 'LAUNCH_READY' ? 'text-green-800' : overallStatus === 'CRITICAL_ISSUES' ? 'text-red-800' : 'text-orange-800'}`}>
              {Object.keys(validations).length} of {validators.length} validations complete
            </p>
          </CardContent>
        </Card>

        {/* Validators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validators.map(validator => {
            const result = validations[validator.id];
            const isLoading = loading[validator.id];

            return (
              <Card key={validator.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {result && getStatusIcon(result.overallStatus || result.status)}
                      {validator.name}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runValidation(validator.id, validator.fn)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Running...' : 'Run'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!result && <p className="text-sm text-slate-600">Not run yet</p>}

                  {result && result.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-semibold">Error</p>
                      <p className="text-xs text-red-700 mt-1">{result.error}</p>
                    </div>
                  )}

                  {result && !result.error && (
                    <>
                      <Badge className={
                        result.overallStatus === 'READY' || result.overallStatus === 'READY_WITH_TESTING' ? 'bg-green-100 text-green-800' :
                        result.overallStatus === 'READY_WITH_MANUAL_STEPS' || result.overallStatus === 'READY_WITH_CONFIGURATION' ? 'bg-orange-100 text-orange-800' :
                        result.status === 'CONFIGURED' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }>
                        {result.overallStatus || result.status}
                      </Badge>

                      {result.nextSteps && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Next Steps:</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {result.nextSteps.slice(0, 2).map((step, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-slate-400">▸</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.checks && result.checks.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Checks ({result.checks.length}):</p>
                          <div className="space-y-1">
                            {result.checks.slice(0, 2).map((check, i) => (
                              <div key={i} className="text-xs flex gap-2">
                                <span>{check.status === 'PASS' ? '✓' : check.status === 'REVIEW' ? '⚠' : '○'}</span>
                                <span className="text-slate-600">{check.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Launch Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Launch Readiness Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { item: 'Payment pipeline validated', critical: true },
              { item: 'Email delivery configured', critical: true },
              { item: 'Monitoring alerts active', critical: false },
              { item: 'Backup/recovery tested', critical: true },
              { item: 'GDPR compliance reviewed', critical: true },
              { item: 'Load testing passed (5,000+ users)', critical: false },
              { item: 'Security checklist completed', critical: true },
              { item: 'Beta user list finalized', critical: false }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-slate-700">{item.item}</span>
                {item.critical && <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Final Decision */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-bold text-blue-900">Ready to Launch?</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✓ All 7 validators must show "READY" or "CONFIGURED" status</p>
              <p>✓ No critical blockers remaining</p>
              <p>✓ Beta user list confirmed (50+ users)</p>
              <p>✓ Support team briefed on launch day</p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              🚀 Launch to Beta (May 8, 2026)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}