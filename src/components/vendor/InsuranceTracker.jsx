import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export default function InsuranceTracker({ vendors = [], insurance = [] }) {
  const getExpirationStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', daysLeft, label: 'Expired' };
    if (daysLeft <= 30) return { status: 'expiring_soon', daysLeft, label: `${daysLeft} days left` };
    return { status: 'valid', daysLeft, label: `${daysLeft} days left` };
  };

  const insuranceWithExpiry = insurance.map(policy => {
    const { status, daysLeft, label } = getExpirationStatus(policy.expiry_date);
    return { ...policy, expiryStatus: status, daysLeft, expiryLabel: label };
  });

  const expiring = insuranceWithExpiry.filter(p => p.expiryStatus === 'expiring_soon');
  const expired = insuranceWithExpiry.filter(p => p.expiryStatus === 'expired');
  const valid = insuranceWithExpiry.filter(p => p.expiryStatus === 'valid');

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(expiring.length > 0 || expired.length > 0) && (
        <div className="grid gap-4">
          {expired.length > 0 && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">{expired.length} Expired Insurance Policies</h3>
                  <p className="text-sm text-red-700 mt-1">Renew immediately to maintain compliance</p>
                </div>
              </div>
            </Card>
          )}

          {expiring.length > 0 && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900">{expiring.length} Insurance Policies Expiring Soon</h3>
                  <p className="text-sm text-yellow-700 mt-1">Renew within 30 days to avoid gaps in coverage</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Insurance List by Status */}
      {[
        { title: 'Expired', policies: expired, bg: 'bg-red-50', border: 'border-red-200' },
        { title: 'Expiring Soon', policies: expiring, bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { title: 'Valid', policies: valid, bg: 'bg-green-50', border: 'border-green-200' }
      ].map(section => (
        section.policies.length > 0 && (
          <div key={section.title}>
            <h3 className="font-semibold text-foreground mb-3">{section.title} ({section.policies.length})</h3>
            <div className="grid gap-4">
              {section.policies.map(policy => {
                const vendor = vendors.find(v => v.id === policy.vendor_id);
                return (
                  <Card key={policy.id} className={`p-4 ${section.bg} border ${section.border}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{vendor?.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {policy.insurance_type.replace(/_/g, ' ')} · {policy.provider}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Policy: {policy.policy_number}
                        </p>
                      </div>
                      <Badge className="bg-white">
                        {policy.expiryLabel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200/50 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Coverage</p>
                        <p className="font-medium">£{(policy.coverage_amount / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Issue Date</p>
                        <p className="font-medium">{new Date(policy.issue_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Expiry Date</p>
                        <p className="font-medium">{new Date(policy.expiry_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      ))}

      {insurance.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No insurance policies recorded</p>
        </Card>
      )}
    </div>
  );
}