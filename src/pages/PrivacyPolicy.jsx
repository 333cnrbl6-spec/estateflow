import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: May 2, 2026</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p>Premiso ("we", "us", "our") operates the Premiso platform. This Privacy Policy explains our data practices and your rights.</p>
            <p className="font-semibold">By using Premiso, you consent to this Privacy Policy. If you disagree, do not use the service.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <div>
              <h3 className="font-semibold mb-2">Account Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Full name, email address, phone number</li>
                <li>Company name, address, registration details</li>
                <li>Account preferences and settings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Property & Tenant Data</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Property addresses, specifications, valuations</li>
                <li>Tenant names, email, phone, references</li>
                <li>Rental history, payment records</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Usage Data</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Login times, IP address, device type, browser</li>
                <li>Features used, pages accessed, time spent</li>
                <li>Error logs and support interactions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>✓ Provide and improve our service</p>
            <p>✓ Send transactional emails (invoices, alerts, confirmations)</p>
            <p>✓ Compliance & regulatory requirements (GDPR, tax, audit)</p>
            <p>✓ Security monitoring and fraud prevention</p>
            <p>✓ Analytics to understand usage patterns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p><span className="font-semibold">Account data:</span> Until deletion requested</p>
            <p><span className="font-semibold">Transaction logs:</span> 7 years (tax & audit)</p>
            <p><span className="font-semibold">Access logs:</span> 90 days</p>
            <p><span className="font-semibold">Deleted data:</span> 90-day quarantine, then purged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights (GDPR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>✓ <span className="font-semibold">Access:</span> Request all data we hold about you</p>
            <p>✓ <span className="font-semibold">Rectification:</span> Correct inaccurate data</p>
            <p>✓ <span className="font-semibold">Erasure:</span> Request deletion of your data (right to be forgotten)</p>
            <p>✓ <span className="font-semibold">Portability:</span> Export your data in machine-readable format</p>
            <p>✓ <span className="font-semibold">Withdraw consent:</span> Opt out of marketing emails</p>
            <p className="text-sm text-slate-600 mt-4">To exercise these rights, contact: privacy@premiso.io</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>✓ Encryption in transit (TLS 1.3)</p>
            <p>✓ Encryption at rest (AES-256)</p>
            <p>✓ Role-based access control (RBAC)</p>
            <p>✓ Audit logging of all data access</p>
            <p>✓ Regular security audits & pen testing</p>
            <p>✓ PCI-DSS compliant (Stripe handles payment data)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Third-Party Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p className="font-semibold">We share data with:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="font-semibold">Stripe</span> — Payment processing (PCI-DSS)</li>
              <li><span className="font-semibold">SendGrid</span> — Email delivery</li>
              <li><span className="font-semibold">AWS</span> — Infrastructure hosting</li>
              <li><span className="font-semibold">Xero/QuickBooks</span> — Accounting integration (optional)</li>
              <li><span className="font-semibold">Sentry</span> — Error tracking (anonymized)</li>
            </ul>
            <p className="text-sm text-slate-600 mt-3">All processors have signed Data Processing Agreements (DPA).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Data Breach Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>If a breach occurs, we will:</p>
            <p>1. Notify affected users within 72 hours</p>
            <p>2. Report to UK ICO within 72 hours</p>
            <p>3. Provide details of compromised data and mitigation steps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Cookies & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>We use cookies for:</p>
            <p>✓ Authentication (session tokens)</p>
            <p>✓ Analytics (Sentry, internal logging)</p>
            <p>You can disable non-essential cookies in settings.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact & Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p className="font-semibold">Data Subject Requests:</p>
            <p>Email: privacy@premiso.io</p>
            <p>Response time: 30 days</p>
            <p className="font-semibold mt-4">Complaints:</p>
            <p>If you're unhappy, contact the UK ICO: ico.org.uk</p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-600 py-8">
          <p>This Privacy Policy is effective as of May 2, 2026 and may be updated at any time.</p>
        </div>
      </div>
    </div>
  );
}