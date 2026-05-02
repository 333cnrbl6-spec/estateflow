import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Shield, Lock } from 'lucide-react';

export default function PreLaunchSecurityChecklist() {
  const [checks, setChecks] = useState({
    authentication: [
      { id: 1, task: 'Two-Factor Authentication enabled', status: 'completed' },
      { id: 2, task: 'Session timeout (30 mins) configured', status: 'completed' },
      { id: 3, task: 'Password complexity enforced', status: 'completed' },
      { id: 4, task: 'Brute force protection (5 attempts)', status: 'in-review' }
    ],
    dataProtection: [
      { id: 5, task: 'GDPR compliance audit passed', status: 'pending' },
      { id: 6, task: 'Data encryption at rest (AES-256)', status: 'completed' },
      { id: 7, task: 'TLS 1.2+ enforced', status: 'completed' },
      { id: 8, task: 'Database backups tested (daily)', status: 'completed' },
      { id: 9, task: 'PII masking in logs', status: 'in-review' }
    ],
    infrastructure: [
      { id: 10, task: 'DDoS protection enabled', status: 'completed' },
      { id: 11, task: 'WAF (Web Application Firewall) active', status: 'in-review' },
      { id: 12, task: 'Load balancing configured', status: 'completed' },
      { id: 13, task: 'CDN deployment complete', status: 'completed' },
      { id: 14, task: 'IP whitelisting for APIs', status: 'in-review' }
    ],
    testing: [
      { id: 15, task: 'Penetration test (external)', status: 'pending' },
      { id: 16, task: 'Load test (10,000 users)', status: 'pending' },
      { id: 17, task: 'Security scanning (OWASP)', status: 'in-review' },
      { id: 18, task: 'Dependency audit (npm)', status: 'completed' }
    ],
    monitoring: [
      { id: 19, task: 'Error tracking (Sentry) active', status: 'completed' },
      { id: 20, task: 'Uptime monitoring 24/7', status: 'completed' },
      { id: 21, task: 'Log aggregation (ELK stack)', status: 'in-review' },
      { id: 22, task: 'Alert thresholds configured', status: 'in-review' }
    ],
    compliance: [
      { id: 23, task: 'Privacy policy published', status: 'completed' },
      { id: 24, task: 'Terms of Service finalized', status: 'completed' },
      { id: 25, task: 'Data Processing Agreement (DPA)', status: 'pending' },
      { id: 26, task: 'GDPR Data Request process', status: 'pending' },
      { id: 27, task: 'Right to be forgotten implementation', status: 'pending' }
    ]
  });

  const toggleStatus = (category, id) => {
    setChecks(prev => ({
      ...prev,
      [category]: prev[category].map(t => {
        if (t.id === id) {
          const statuses = ['pending', 'in-review', 'completed'];
          const currentIndex = statuses.indexOf(t.status);
          return { ...t, status: statuses[(currentIndex + 1) % statuses.length] };
        }
        return t;
      })
    }));
  };

  const getStats = () => {
    const all = Object.values(checks).flat();
    const completed = all.filter(t => t.status === 'completed').length;
    return { completed, total: all.length };
  };

  const stats = getStats();
  const progress = Math.round((stats.completed / stats.total) * 100);

  const StatusIcon = ({ status }) => {
    if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'in-review') return <AlertCircle className="w-5 h-5 text-orange-600" />;
    return <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Pre-Launch Security Checklist
          </h1>
          <p className="text-lg text-slate-600">Ensure production readiness & compliance</p>
        </div>

        {/* Progress */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-900">Overall Security Status</h2>
              <Badge className="text-lg px-3 py-1">{stats.completed}/{stats.total}</Badge>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div className="bg-green-600 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-blue-800">{progress}% complete</p>
          </CardContent>
        </Card>

        {/* Checklists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(checks).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleStatus(category, item.id)}
                    className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <StatusIcon status={item.status} />
                      <p className={item.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}>
                        {item.task}
                      </p>
                    </div>
                    <Badge className={
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in-review' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-800'
                    }>
                      {item.status === 'completed' ? '✓' : item.status === 'in-review' ? '⏳' : '○'}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Critical Items */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">⚠️ Critical Path Items (MUST COMPLETE)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-red-900">These must be completed before launching to production:</p>
            <ul className="space-y-1 text-red-800 ml-4">
              <li>✓ External penetration test (Week 1)</li>
              <li>✓ GDPR compliance audit & DPA signed</li>
              <li>✓ Load testing (10,000 concurrent users)</li>
              <li>✓ Security scanning passed (0 critical, 0 high)</li>
              <li>✓ Uptime monitoring & alerting live</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>📋 This Week's Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-slate-900">Schedule & Execute:</p>
            <ul className="space-y-1 text-slate-700 ml-4">
              <li>☐ Book penetration testing firm (May 3)</li>
              <li>☐ Initiate GDPR audit with legal (May 3)</li>
              <li>☐ Set up load testing environment (May 4)</li>
              <li>☐ Run security scanner (May 5)</li>
              <li>☐ Review & fix all findings (May 6-7)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}