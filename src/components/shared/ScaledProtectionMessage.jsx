import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Home, Building2, Zap } from 'lucide-react';

export default function ScaledProtectionMessage({ variant = 'full' }) {
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4 rounded-lg">
        <p className="text-sm font-medium flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Legislation benefits everyone. Premiso makes those protections accessible to all—same protection at every scale, not behind premium pricing.
        </p>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-foreground mb-2">Protection Built Into Every Tier</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your portfolio size doesn't determine your legal protection. Small landlords get the same automated compliance safeguards as large property groups.
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span>1-5 properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>6-50 properties</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>50+ properties</span>
              </div>
            </div>
            <p className="text-xs text-blue-700 font-medium mt-3">All have same compliance automation, deposit tracking, and legal protection.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border-l-4 border-l-blue-600 p-6 rounded">
        <h2 className="font-bold text-lg text-foreground mb-3">Compliance Protection for Every Scale</h2>
        <p className="text-muted-foreground mb-4">
          Whether you're a solo landlord managing your first property or a multi-portfolio property group, Premiso scales its compliance protection to match your needs—not your budget.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded border border-blue-200">
            <p className="font-bold text-sm mb-2">Solo Landlords</p>
            <p className="text-xs text-muted-foreground">Get automated gas safety alerts, deposit protection tracking, and right-to-rent verification just like enterprise users.</p>
          </div>
          <div className="p-4 bg-white rounded border border-green-200">
            <p className="font-bold text-sm mb-2">Property Groups</p>
            <p className="text-xs text-muted-foreground">Same legal safeguards plus bulk compliance reporting, vendor management, and audit trails for every property.</p>
          </div>
          <div className="p-4 bg-white rounded border border-emerald-200">
            <p className="font-bold text-sm mb-2">Agents & Managers</p>
            <p className="text-xs text-muted-foreground">Handle portfolios of any size with centralized compliance verification, certificate tracking, and tenant screening at scale.</p>
          </div>
        </div>
      </div>
    </div>
  );
}