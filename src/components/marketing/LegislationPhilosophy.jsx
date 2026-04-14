import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, Scale, TrendingUp } from 'lucide-react';

/**
 * Core Philosophy: Legislation Benefits Everyone
 * Premiso was built to make those protections accessible at every scale
 */

export const LegislationBenefitsMessage = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border-l-4 border-l-blue-600 p-6 rounded">
      <h3 className="font-bold text-foreground text-lg mb-3">Why Legislation Exists</h3>
      <p className="text-muted-foreground mb-4">
        Property legislation isn't punitive—it's protective. Gas safety regulations exist to prevent deaths. Deposit protection laws exist to prevent theft. Right-to-rent checks exist to prevent exploitation. These rules level the playing field and protect everyone: landlords, tenants, and society.
      </p>
      <p className="text-sm text-blue-900 font-medium">
        The problem: compliance used to require expensive lawyers, accountants, and specialists. <strong>Premiso democratizes it.</strong>
      </p>
    </div>

    {/* Who Benefits */}
    <div>
      <h3 className="font-bold text-foreground mb-4">Who Benefits From Legislation</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-green-600">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-foreground mb-2">Tenants</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Protected from unsafe conditions</li>
                <li>✓ Deposit protected from unfair deductions</li>
                <li>✓ Right to rent verified (no trafficking)</li>
                <li>✓ Fair tenancy terms enforced</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-foreground mb-2">Landlords</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Legal clarity (no guessing)</li>
                <li>✓ Protection from disputes</li>
                <li>✓ Defense against claims</li>
                <li>✓ Professional credibility</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-foreground mb-2">Society</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>✓ Safe housing standards</li>
                <li>✓ Fair rental market</li>
                <li>✓ Reduced exploitation</li>
                <li>✓ Consumer protection</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>

    {/* The Problem Premiso Solves */}
    <Card className="p-6 bg-orange-50 border-orange-200">
      <h3 className="font-bold text-foreground mb-3">The Compliance Paradox</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-orange-900 mb-1">❌ Before: Compliance Was Expensive</p>
          <p className="text-muted-foreground">A solo landlord had to choose: hire a solicitor (£500+/month) or risk prosecution (£30,000 fine). Small landlords couldn't afford compliance. So they cut corners.</p>
        </div>
        <div>
          <p className="font-medium text-green-900 mb-1">✅ Premiso: Compliance Is Accessible</p>
          <p className="text-muted-foreground">Automated deposit tracking, certificate alerts, right-to-rent checks, and audit trails cost the same as a cup of coffee per property. Legislation's protections are now available to everyone.</p>
        </div>
      </div>
    </Card>

    {/* Why We Built This */}
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300">
      <h3 className="font-bold text-foreground mb-3">Why We Built Premiso</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Legislation is democratically created to protect everyone. But compliance used to require expensive specialists—which meant only wealthy portfolio owners got protection. That's unjust.
      </p>
      <p className="text-sm text-blue-900 font-medium">
        We built Premiso to do one thing: make legislation's protections—deposit safety, safety verification, legal audit trails—accessible to every landlord, every tenant, every business size. No compromises on protection based on budget.
      </p>
    </Card>
  </div>
);

export const DemoPhilosophy = [
  "Legislation isn't bureaucracy—it's safety and fairness. Gas safety regs prevent deaths. Deposit protection prevents theft. Right-to-rent prevents trafficking.",
  "But compliance used to be expensive. Solicitors, accountants, software licenses. Small landlords couldn't afford it. So they either cut corners or overpaid.",
  "Premiso solves this: we've automated compliance so thoroughly that a 1-property landlord has the same legal protections as a 500-property group. Same cost model.",
  "That's the core design: legislation's protections shouldn't be a luxury good. They should be standard, accessible, and affordable to everyone.",
  "When tenants see 'Premiso Compliant,' they know: deposit is protected, certs are current, landlord has done due diligence. No guessing.",
  "When landlords use Premiso, they're not just protecting themselves—they're participating in fair, regulated rental market. Everyone wins."
];

export const PrintCopyPhilosophy = `
LEGISLATION BENEFITS EVERYONE. PREMISO MAKES IT ACCESSIBLE.

Property legislation exists to protect tenants from unsafe conditions, landlords from disputes, and society from exploitation. Deposit protection laws, safety regulations, and right-to-rent checks are fair, necessary, and good.

The problem: compliance used to require expensive lawyers and specialists—which meant only wealthy portfolio owners could afford legal protection. Small landlords had to choose between hiring a solicitor or risking £30,000 fines.

Premiso democratizes compliance. Automated deposit tracking, certificate alerts, enforcement blocks, and audit trails cost the same whether you manage 1 property or 100. Legislation's protections—designed to benefit everyone—are now accessible to everyone.

We believe fairness in housing shouldn't be a premium feature.
`;