import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function LaunchDayRunbook() {
  const [completedTasks, setCompletedTasks] = useState({});

  const timeline = [
    {
      time: '06:00',
      tasks: [
        { id: 'db-backup', task: 'Final database backup', owner: 'DevOps', critical: true },
        { id: 'health-check', task: 'Run health checks on all services', owner: 'QA', critical: true },
        { id: 'monitor-setup', task: 'Verify Sentry & monitoring alerts active', owner: 'DevOps', critical: true }
      ]
    },
    {
      time: '07:00',
      tasks: [
        { id: 'stripe-live', task: 'Switch Stripe to live mode', owner: 'Finance', critical: true },
        { id: 'email-test', task: 'Send test welcome email to [test@premiso.io](mailto:test@premiso.io)', owner: 'Ops', critical: true },
        { id: 'dns-verify', task: 'Verify DNS propagation for payment webhooks', owner: 'DevOps', critical: false }
      ]
    },
    {
      time: '08:00',
      tasks: [
        { id: 'team-briefing', task: 'Team standup: final checklist & incident contacts', owner: 'CTO', critical: true },
        { id: 'rollback-plan', task: 'Confirm rollback procedure & access credentials', owner: 'DevOps', critical: true },
        { id: 'comms-ready', task: 'Prepare launch announcement & social posts', owner: 'Marketing', critical: false }
      ]
    },
    {
      time: '09:00',
      tasks: [
        { id: 'go-live', task: '🚀 ENABLE BETA USER ACCESS (200 users)', owner: 'Product', critical: true },
        { id: 'smoke-test', task: 'Run smoke tests: login, dashboard, payment', owner: 'QA', critical: true },
        { id: 'first-users', task: 'Monitor first user logins & onboarding', owner: 'CX', critical: true }
      ]
    },
    {
      time: '09:30',
      tasks: [
        { id: 'first-payment', task: 'Process test payment from first user', owner: 'Finance', critical: false },
        { id: 'error-monitor', task: 'Watch error rate (target < 0.1%)', owner: 'DevOps', critical: true },
        { id: 'perf-monitor', task: 'Monitor API response times (target < 500ms p95)', owner: 'DevOps', critical: true }
      ]
    },
    {
      time: '10:00',
      tasks: [
        { id: 'announce', task: 'Post launch announcement on social media', owner: 'Marketing', critical: false },
        { id: 'email-wave', task: 'Send beta invitation emails to 200 users', owner: 'Ops', critical: true },
        { id: 'support-ready', task: 'Support team ready for first inquiries', owner: 'Support', critical: false }
      ]
    },
    {
      time: '12:00',
      tasks: [
        { id: 'midday-check', task: 'Team check-in: system health & user feedback', owner: 'CTO', critical: true },
        { id: 'capacity-monitor', task: 'Verify API & DB capacity within limits', owner: 'DevOps', critical: true }
      ]
    },
    {
      time: '17:00',
      tasks: [
        { id: 'eod-check', task: 'End-of-day review: errors, performance, user feedback', owner: 'CTO', critical: false },
        { id: 'backup-verify', task: 'Verify automatic backup executed successfully', owner: 'DevOps', critical: false }
      ]
    }
  ];

  const incidents = [
    { issue: 'API latency > 1s', action: 'Scale API servers +5 instances, investigate slow queries', escalate: 'CTO' },
    { issue: 'Error rate > 0.5%', action: 'Enable debug logging, check Sentry dashboard', escalate: 'Dev Team' },
    { issue: 'Payment webhook failures', action: 'Verify Stripe webhook endpoint, test with Stripe CLI', escalate: 'Finance' },
    { issue: 'Email delivery failures', action: 'Check SendGrid quota & bounce logs', escalate: 'Ops' },
    { issue: 'Database connection exhaustion', action: 'Scale database, check for connection leaks', escalate: 'DBA' }
  ];

  const toggleTask = (id) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🚀 Launch Day Runbook</h1>
          <p className="text-lg text-slate-600">May 8, 2026 — Beta Launch Timeline</p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {timeline.map((block, i) => (
            <Card key={i} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-600 text-white text-lg px-3">{block.time}</Badge>
                  <p className="text-slate-600">{block.tasks.length} tasks</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {block.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={completedTasks[task.id] || false}
                      onChange={() => toggleTask(task.id)}
                      className="mt-1 w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold ${completedTasks[task.id] ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.task}
                      </p>
                      <p className="text-sm text-slate-600">Owner: {task.owner}</p>
                    </div>
                    {task.critical && <Badge className="bg-red-100 text-red-800">Critical</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Incident Response */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-6 h-6" />
              Incident Response Playbook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incidents.map((incident, i) => (
              <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                <p className="font-semibold text-red-900">{incident.issue}</p>
                <p className="text-sm text-red-800 mt-1">👉 Action: {incident.action}</p>
                <p className="text-sm text-red-700 mt-1">Escalate to: <span className="font-semibold">{incident.escalate}</span></p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Contacts */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle>📞 Critical Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">On-Call Ops</p>
                <p className="text-lg text-slate-900">+44 [NUMBER]</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">CTO</p>
                <p className="text-lg text-slate-900">[EMAIL]</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Support Lead</p>
                <p className="text-lg text-slate-900">Slack #launch-support</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Stripe Support</p>
                <p className="text-lg text-slate-900">dashboard.stripe.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rollback Procedure */}
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">🔄 Rollback Procedure (Emergency)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p className="font-semibold">If critical issues occur:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Announce rollback in #launch-incident</li>
              <li>Switch Stripe back to test mode</li>
              <li>Restore database from 06:00 backup</li>
              <li>Disable user access & post status page update</li>
              <li>Perform smoke tests on restored version</li>
              <li>Schedule post-mortem meeting</li>
            </ol>
            <p className="text-sm text-yellow-900 mt-3 font-semibold">Estimated recovery: 30-60 minutes</p>
          </CardContent>
        </Card>

        {/* Success Criteria */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">✓ Success Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-green-900">
            <p>✓ 200 beta users can log in without errors</p>
            <p>✓ API response time &lt; 500ms p95</p>
            <p>✓ Error rate &lt; 0.1%</p>
            <p>✓ Stripe payments processing successfully</p>
            <p>✓ Emails delivering to users</p>
            <p>✓ No database connection issues</p>
            <p>✓ Monitoring alerts working</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}