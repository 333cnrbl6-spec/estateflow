import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';

export default function ComplianceProtectionPitch() {
  return (
    <div className="space-y-8">
      {/* Hero Message */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-emerald-600 text-white p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-3">Compliance Protection That Scales With You</h2>
        <p className="text-lg text-blue-100 mb-4">
          Enterprise-grade legal safeguards built into every subscription tier. Whether you manage 1 property or 1,000, you get the same automated compliance protection. No premium pricing for doing the right thing.
        </p>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-white text-blue-600 px-3 py-1">Same protection at every scale</Badge>
          <Badge className="bg-white text-blue-600 px-3 py-1">Automated legal compliance</Badge>
          <Badge className="bg-white text-blue-600 px-3 py-1">Built-in prosecution protection</Badge>
        </div>
      </div>

      {/* Three Scenarios - Same Protection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            scenario: 'New Landlord, 1 Property',
            problems: ['No compliance expertise', 'Scared of fines', 'Limited budget'],
            solution: 'Automated gas safety alerts, deposit protection audit trail, right-to-rent tracking—all built-in'
          },
          {
            scenario: 'Growing Portfolio, 15 Properties',
            problems: ['Managing multiple tenancies', 'Compliance scattered across files', 'Vendor coordination'],
            solution: 'Centralized compliance dashboard, bulk certificate tracking, automated vendor management—same system'
          },
          {
            scenario: 'Large Property Group, 200+ Properties',
            problems: ['Enterprise compliance burden', 'Audit readiness', 'Risk management'],
            solution: 'Complete audit trails, compliance reporting, automated enforcement blocks—no separate enterprise tier needed'
          }
        ].map((item, idx) => (
          <Card key={idx} className="p-6 border-l-4 border-l-blue-600">
            <p className="font-bold text-foreground mb-3">{item.scenario}</p>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">Challenges:</p>
              <ul className="space-y-1">
                {item.problems.map((p, jdx) => (
                  <li key={jdx} className="text-xs text-muted-foreground">• {p}</li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-green-700 font-medium flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {item.solution}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Economic Model */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Why We Don't Charge Extra for Compliance
        </h3>
        <p className="text-muted-foreground mb-4">
          Compliance protection is foundational to property management, not a luxury feature. We've architected Premiso so that legal safeguards scale proportionally to your portfolio without premium pricing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border border-green-200">
            <p className="font-medium text-sm mb-2">❌ Traditional SaaS Model</p>
            <p className="text-xs text-muted-foreground">Small users: basic compliance. Enterprise users: pay 3-5x for automation, audit trails, and enforcement.</p>
          </div>
          <div className="bg-white p-4 rounded border border-green-300">
            <p className="font-medium text-sm mb-2">✅ Premiso Model</p>
            <p className="text-xs text-muted-foreground">All users: same automated compliance, deposit protection, certificate tracking, and audit trails. No tier-based limits.</p>
          </div>
        </div>
      </Card>

      {/* What They Get */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Built-In Protection (All Users, All Tiers)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Automated 30-day compliance alerts',
            'Deposit protection audit trail with proof',
            'Right-to-rent tracking & renewal reminders',
            'Gas/Electrical/EPC certificate automation',
            'Fire safety & HMO license tracking',
            'Vendor compliance verification',
            'Tenant screening & background checks',
            'Legal compliance enforcement blocks',
            'Complete audit trails for regulators',
            'Tenant & landlord legal education'
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Messaging for Different Audiences */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="font-bold text-foreground mb-4">How To Talk About This</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-foreground mb-1">💰 For price-sensitive prospects:</p>
            <p className="text-muted-foreground">"You don't pay per-property for compliance. Enterprise protection comes built-in at every price point."</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">📈 For growing portfolios:</p>
            <p className="text-muted-foreground">"Your compliance automation doesn't change as you scale. Same safeguards at 10 properties as at 100."</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">⚖️ For legal-minded users:</p>
            <p className="text-muted-foreground">"We've democratized legal compliance. You shouldn't need an expensive software license to protect yourself from a £30,000 gas safety fine."</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">🏢 For enterprise users:</p>
            <p className="text-muted-foreground">"Run 200+ properties with the same automated audit trails and enforcement blocks as solo landlords. Scale without fragmentation."</p>
          </div>
        </div>
      </div>
    </div>
  );
}