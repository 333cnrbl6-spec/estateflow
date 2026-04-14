import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ComplianceLegislationPanel({ property, certificates, deposits }) {
  const legislationChecks = [
    {
      name: 'Gas Safety (1998 Regulations)',
      requirement: 'Annual certificate from registered engineer',
      status: certificates?.gas ? 'compliant' : 'missing',
      expiry: certificates?.gas?.expiry_date,
      penalty: '£30,000 fine + £5,000/day'
    },
    {
      name: 'Electrical Safety (2020 Standards)',
      requirement: 'EICR max 5 years old',
      status: certificates?.electrical ? 'compliant' : 'missing',
      expiry: certificates?.electrical?.expiry_date,
      penalty: '£30,000 fine'
    },
    {
      name: 'EPC (Energy Regulations)',
      requirement: 'Valid EPC before letting',
      status: certificates?.epc ? 'compliant' : 'missing',
      expiry: certificates?.epc?.expiry_date,
      penalty: '£5,000-£5,500 fine'
    },
    {
      name: 'Deposit Protection (Housing Act 2004)',
      requirement: 'Protect in scheme + prescribed info within 30 days',
      status: deposits?.length > 0 ? 'compliant' : 'missing',
      expiry: null,
      penalty: '3x deposit liability'
    },
    {
      name: 'Fire Safety (Regulatory Reform Order 2005)',
      requirement: 'Annual FRA for HMOs',
      status: property?.property_type !== 'hmo' ? 'n/a' : 'check',
      expiry: null,
      penalty: '£20,000 fine + imprisonment'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'missing':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'expiring':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 border-green-300';
      case 'missing':
        return 'bg-red-100 border-red-300';
      case 'expiring':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-l-blue-600 p-4 rounded">
        <p className="text-sm text-blue-900">
          <strong>Your Legal Obligations:</strong> As a landlord, you must ensure all properties meet statutory safety and tenancy requirements. Failure to comply can result in fines, prosecution, and civil liability.
        </p>
      </div>

      {legislationChecks.map((check, idx) => (
        <Card key={idx} className={`p-4 border-l-4 ${getStatusColor(check.status)}`}>
          <div className="flex items-start gap-3">
            {getStatusIcon(check.status)}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground">{check.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{check.requirement}</p>
                </div>
                <Badge className={
                  check.status === 'compliant' ? 'bg-green-600' :
                  check.status === 'missing' ? 'bg-red-600' :
                  check.status === 'expiring' ? 'bg-orange-600' :
                  'bg-slate-400'
                }>
                  {check.status === 'n/a' ? 'N/A' : check.status.toUpperCase()}
                </Badge>
              </div>
              {check.expiry && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Expires: {new Date(check.expiry).toLocaleDateString()}
                </p>
              )}
              <p className="text-xs mt-2 font-medium text-red-600">
                Penalty: {check.penalty}
              </p>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-4 bg-slate-50">
        <h4 className="font-bold text-foreground mb-3">Due Diligence Checklist</h4>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Annual Gas Safety Certificate obtained and current</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>EICR obtained within last 5 years</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Valid EPC for each property</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>All deposits protected within scheme</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Prescribed information served to tenants</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Right to Rent checks completed and tracked</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Fire Risk Assessment (HMOs only)</span>
          </label>
        </div>
      </Card>
    </div>
  );
}