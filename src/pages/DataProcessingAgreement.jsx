import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DataProcessingAgreement() {
  const handleDownloadPDF = () => {
    const content = `
DATA PROCESSING AGREEMENT (DPA)
Between Premiso Ltd (Data Processor) and Customer (Data Controller)

Effective: May 8, 2026

1. DEFINITIONS
- Controller: Customer, who determines purposes and means of processing
- Processor: Premiso, who processes personal data on behalf of Controller
- Personal Data: Any information relating to an identified natural person
- Processing: Any operation on personal data (collection, storage, use, deletion, etc.)
- Sub-processor: Third-party who processes data on behalf of Processor

2. SCOPE
This Agreement governs the processing of personal data in the Premiso platform, including:
- Tenant names, emails, phone numbers
- Property addresses and details
- Transaction records
- Usage data and analytics

3. PROCESSOR OBLIGATIONS
Premiso shall:
- Process data only on documented instructions from Controller
- Ensure persons authorized to process data are under confidentiality
- Implement appropriate technical and organizational security measures
- Not process data for own purposes
- Notify Controller of data breaches without undue delay
- Delete or return personal data upon contract termination

4. SUB-PROCESSORS
Premiso uses the following Sub-processors:
- Stripe (payment processing) — https://stripe.com/privacy
- AWS (data hosting) — https://aws.amazon.com/privacy
- SendGrid (email delivery) — https://sendgrid.com/privacy
- Sentry (error tracking) — https://sentry.io/privacy

Controller approves these Sub-processors. Controller will be notified of any new Sub-processors.

5. SECURITY MEASURES
Premiso implements:
- Encryption in transit (TLS 1.3) and at rest (AES-256)
- Role-based access control (RBAC)
- Regular security audits and penetration testing
- 24/7 monitoring and incident response
- Annual third-party security assessment
- ISO 27001 certification (target 2026)

6. DATA SUBJECT RIGHTS
Premiso shall, on Controller request:
- Facilitate data subject access requests (within 30 days)
- Assist with rectification of inaccurate data
- Assist with erasure requests (right to be forgotten)
- Support data portability requests
- Document processing activities (audit trail)

7. DATA BREACHES
Upon discovery of unauthorized access or loss of personal data:
- Premiso shall notify Controller without undue delay
- Premiso shall provide available facts and impact assessment
- Premiso shall cooperate with data protection authorities
- Controller responsible for notifying data subjects (where required)

8. DATA TRANSFERS
If data is transferred outside the UK/EEA:
- Standard Contractual Clauses (SCCs) apply
- Controller ensures legal basis for transfer
- Premiso provides transfer risk assessment

9. DURATION & TERMINATION
This Agreement:
- Begins on May 8, 2026
- Continues for duration of Premiso subscription
- Automatically terminated upon contract end
- Upon termination, Premiso shall delete all personal data within 30 days

10. AUDIT & COMPLIANCE
Controller may:
- Request audit of Premiso's processing activities
- Conduct inspections of security measures
- Require SOC 2 Type II audit report (Premiso provides annually)

11. LIABILITY
- Premiso liable for losses caused by breach of this Agreement
- Liability capped at fees paid in preceding 12 months
- Liability excluded for Controller's breach or misuse

12. AMENDMENTS
Premiso may update this Agreement with 30 days' notice.
Continued use of Premiso constitutes acceptance.

13. GOVERNING LAW
This Agreement governed by UK law.
Disputes resolved under UK courts' jurisdiction.

---

SIGNATURE

By clicking 'Accept', you agree to this Data Processing Agreement.

Premiso Ltd
Date: May 2, 2026

Customer Name: ________________
Customer Email: ________________
Date: ________________
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'DPA_Premiso.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Processing Agreement</h1>
            <p className="text-slate-600">Premiso Ltd & Customer</p>
          </div>
          <Button onClick={handleDownloadPDF} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Definitions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p><span className="font-semibold">Controller:</span> You (Customer), who determines purposes and means of processing</p>
            <p><span className="font-semibold">Processor:</span> Premiso, who processes personal data on your behalf</p>
            <p><span className="font-semibold">Personal Data:</span> Information about identified natural persons (names, emails, phone)</p>
            <p><span className="font-semibold">Processing:</span> Any operation on personal data (collection, use, storage, deletion)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Processor Obligations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>Premiso shall:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Process data only per your documented instructions</li>
              <li>Maintain confidentiality of authorized personnel</li>
              <li>Implement security measures (encryption, RBAC, auditing)</li>
              <li>Not use data for own purposes</li>
              <li>Notify you of data breaches within 24 hours</li>
              <li>Delete all data within 30 days of termination</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Sub-Processors (Approved)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p className="text-sm text-slate-600">You approve processing by these sub-processors:</p>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded border">
                <p className="font-semibold">Stripe (Payment Processing)</p>
                <p className="text-sm text-slate-600">Credit card data — PCI-DSS compliant</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border">
                <p className="font-semibold">AWS (Cloud Hosting)</p>
                <p className="text-sm text-slate-600">All customer data stored securely</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border">
                <p className="font-semibold">SendGrid (Email Delivery)</p>
                <p className="text-sm text-slate-600">Transactional emails only</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border">
                <p className="font-semibold">Sentry (Error Tracking)</p>
                <p className="text-sm text-slate-600">Anonymized error logs only</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Security Measures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>✓ Encryption in transit (TLS 1.3) and at rest (AES-256)</p>
            <p>✓ Role-based access control (RBAC)</p>
            <p>✓ 24/7 monitoring & incident response</p>
            <p>✓ Annual security audits & pen testing</p>
            <p>✓ ISO 27001 certification (target 2026)</p>
            <p>✓ SOC 2 Type II audit report (provided annually)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights (Data Subject)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>✓ Right to access your data</p>
            <p>✓ Right to correction (rectification)</p>
            <p>✓ Right to deletion (right to be forgotten)</p>
            <p>✓ Right to data portability (export)</p>
            <p>✓ Right to restrict processing</p>
            <p className="text-sm text-slate-600 mt-3">Submit requests to: privacy@premiso.io (30-day response)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Data Breaches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>If unauthorized access occurs, Premiso shall:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Notify you within 24 hours</li>
              <li>Provide facts and impact assessment</li>
              <li>Cooperate with data protection authorities</li>
              <li>You notify affected data subjects (where required by law)</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Data Retention & Deletion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700">
            <p><span className="font-semibold">During subscription:</span> Data retained as long as needed</p>
            <p><span className="font-semibold">Upon termination:</span> All data deleted within 30 days</p>
            <p><span className="font-semibold">Audit logs:</span> Retained for 90 days, then anonymized</p>
            <p><span className="font-semibold">Backups:</span> Retained for 30 days, then destroyed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Audit & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-slate-700">
            <p>You may:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Request audit of Premiso's processing activities</li>
              <li>Conduct inspections of security measures</li>
              <li>Review SOC 2 Type II audit report (provided annually)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">✓ Ready to Sign?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-emerald-700">
            <p>This DPA is effective immediately upon acceptance.</p>
            <p>By using Premiso from May 8, 2026, you agree to this Data Processing Agreement.</p>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              ✓ Accept DPA
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}