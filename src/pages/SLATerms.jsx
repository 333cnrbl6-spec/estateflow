import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SLATerms() {
  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      uptime: '99.0%',
      response: '24 hours',
      support: 'Email',
      features: [
        '5 properties',
        '30-day data retention',
        'Community support'
      ]
    },
    {
      name: 'Professional',
      price: '£99/month',
      uptime: '99.5%',
      response: '4 hours',
      support: 'Email & Chat',
      features: [
        'Unlimited properties',
        '7-year data retention',
        'Priority email support',
        'Quarterly review calls'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      uptime: '99.9%',
      response: '1 hour',
      support: 'Dedicated',
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        'Custom integrations',
        '24/7 phone support',
        'SLA guarantee'
      ]
    }
  ];

  const credits = [
    { uptime: '99.5% - 99.0%', credit: '10% monthly fee' },
    { uptime: '99.0% - 95.0%', credit: '25% monthly fee' },
    { uptime: '< 95.0%', credit: '100% monthly fee' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Service Level Agreements (SLA)</h1>
          <p className="text-lg text-slate-600">Premiso Beta — Effective May 8, 2026</p>
        </div>

        {/* Tier Comparison */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Beta Tier Commitments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <Card key={i} className={tier.name === 'Professional' ? 'border-2 border-blue-500 shadow-lg' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{tier.price}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Uptime SLA</span>
                      <span className="font-bold text-slate-900">{tier.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Support Response</span>
                      <span className="font-bold text-slate-900">{tier.response}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Support Channel</span>
                      <span className="font-bold text-slate-900">{tier.support}</span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">FEATURES:</p>
                    <ul className="space-y-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="text-xs text-slate-600">✓ {f}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SLA Details */}
        <Card>
          <CardHeader>
            <CardTitle>Uptime Definition & Measurement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p><span className="font-semibold">Measured:</span> Percentage of time our API endpoint responds with &lt;500ms latency</p>
            <p><span className="font-semibold">Excluded:</span> Scheduled maintenance (2-4am UTC, 4x/month), customer misuse, third-party failures</p>
            <p><span className="font-semibold">Monitoring:</span> Continuous from 3+ global locations, reported hourly</p>
            <p><span className="font-semibold">Dashboard:</span> status.premiso.io (real-time updates)</p>
          </CardContent>
        </Card>

        {/* Support Response Times */}
        <Card>
          <CardHeader>
            <CardTitle>Support Response Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-red-500 pl-4">
                <p className="font-semibold text-red-900">Critical (P1)</p>
                <p className="text-sm text-slate-700">Service down, data loss</p>
                <p className="text-lg font-bold text-red-600 mt-2">1 hour</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-semibold text-orange-900">High (P2)</p>
                <p className="text-sm text-slate-700">Feature broken, users affected</p>
                <p className="text-lg font-bold text-orange-600 mt-2">4 hours</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-blue-900">Normal (P3)</p>
                <p className="text-sm text-slate-700">Minor bugs, questions</p>
                <p className="text-lg font-bold text-blue-600 mt-2">24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Credits */}
        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">Service Credits for Downtime</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Monthly Uptime</th>
                  <th className="text-right p-3 font-semibold">Service Credit</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-emerald-100">
                    <td className="p-3">{row.uptime}</td>
                    <td className="text-right p-3 font-semibold">{row.credit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-emerald-700 mt-3">Credits issued automatically; no request needed.</p>
          </CardContent>
        </Card>

        {/* Data & Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Security Guarantees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p>✓ <span className="font-semibold">Encryption:</span> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</p>
            <p>✓ <span className="font-semibold">Backups:</span> Daily automated backups, 30-day retention</p>
            <p>✓ <span className="font-semibold">Disaster Recovery:</span> RTO 30 minutes, RPO 1 hour</p>
            <p>✓ <span className="font-semibold">Compliance:</span> GDPR, UK Data Protection Act 2018, SOC 2 (in progress)</p>
            <p>✓ <span className="font-semibold">Audit Logs:</span> 90 days of full audit trail</p>
          </CardContent>
        </Card>

        {/* Maintenance Window */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p><span className="font-semibold">Window:</span> Tuesdays & Thursdays, 2-4am UTC</p>
            <p><span className="font-semibold">Frequency:</span> 1-2 times per month (max 8 hours/month)</p>
            <p><span className="font-semibold">Notice:</span> 48 hours advance notice via email & status page</p>
            <p className="text-sm text-slate-600">Maintenance windows are excluded from uptime SLA calculation.</p>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">SLA Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-yellow-900 text-sm">
            <p>This SLA does not cover:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Customer misconfiguration or misuse</li>
              <li>Third-party service failures (Stripe, AWS, SendGrid)</li>
              <li>Network issues outside our control</li>
              <li>DDoS attacks or security incidents</li>
              <li>Scheduled maintenance windows (notified in advance)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions or Issues?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>Email: support@premiso.io</p>
            <p>Status: status.premiso.io</p>
            <p>Support Hours: 9am-5pm UK time (Monday-Friday)</p>
            <p className="text-sm text-slate-600 mt-3">Enterprise tier includes 24/7 support with dedicated on-call.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}