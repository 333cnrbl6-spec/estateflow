import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function TenantLegalInformation({ tenancy }) {
  if (!tenancy) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No active tenancy found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Rights */}
      <Card className="p-6 border-l-4 border-l-blue-600">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-3">Your Tenancy Rights</h3>
            <div className="space-y-2 text-sm">
              <p>✓ <strong>Deposit Protection:</strong> Your deposit is legally protected in a registered scheme. Your landlord must give you prescribed information within 30 days.</p>
              <p>✓ <strong>Habitability:</strong> Property must be safe, clean, and in good repair. Landlord must maintain structure and utilities.</p>
              <p>✓ <strong>Safety Certificates:</strong> Gas, electrical, and fire safety checks must be valid and current.</p>
              <p>✓ <strong>Quiet Enjoyment:</strong> You have the right to quiet possession without unreasonable intrusions.</p>
              <p>✓ <strong>Written Tenancy Agreement:</strong> Terms must be fair and in plain English.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Your Responsibilities */}
      <Card className="p-6 border-l-4 border-l-orange-600">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-3">Your Tenancy Responsibilities</h3>
            <div className="space-y-2 text-sm">
              <p>• Pay rent on time and in full as agreed</p>
              <p>• Keep the property clean and well-maintained</p>
              <p>• Report repairs promptly to your landlord</p>
              <p>• Not damage the property beyond normal wear and tear</p>
              <p>• Follow any reasonable terms in your tenancy agreement</p>
              <p>• Allow landlord access for repairs/inspections (with notice)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Deposit Protection Status */}
      {tenancy.deposit_protection && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-bold text-green-900 mb-4">Deposit Protection Confirmation</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Protected in: {tenancy.deposit_protection.scheme_name}</p>
                <p className="text-green-700 text-xs mt-1">Reference: {tenancy.deposit_protection.scheme_reference}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Prescribed Information Received</p>
                <p className="text-green-700 text-xs mt-1">{new Date(tenancy.deposit_protection.prescribed_information_served_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-green-300">
              <p className="text-xs text-green-800"><strong>What this means:</strong> Your deposit is legally protected. If there's a dispute, it will be handled fairly according to the law. Your landlord cannot keep your deposit unfairly.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Safety Certificates */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4">Safety Certificates & Inspections</h3>
        <div className="space-y-3">
          <div className="flex items-start justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-foreground">Gas Safety Certificate</p>
              <p className="text-xs text-muted-foreground mt-1">Must be current if property has gas appliances</p>
            </div>
            <Badge className="bg-green-600">Current</Badge>
          </div>
          <div className="flex items-start justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-foreground">Electrical Safety Report (EICR)</p>
              <p className="text-xs text-muted-foreground mt-1">Must be current (max 5 years old)</p>
            </div>
            <Badge className="bg-green-600">Current</Badge>
          </div>
          <div className="flex items-start justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-foreground">Energy Performance Certificate (EPC)</p>
              <p className="text-xs text-muted-foreground mt-1">Shows energy efficiency rating of property</p>
            </div>
            <Badge className="bg-green-600">Current</Badge>
          </div>
        </div>
      </Card>

      {/* Legislation Reference */}
      <Card className="p-6 bg-slate-50">
        <h3 className="font-bold text-foreground mb-3">Legal Framework</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p><strong>Housing Act 2004:</strong> Sets out your rights regarding deposit protection and property standards</p>
          <p><strong>Gas Safety (Installation and Use) Regulations 1998:</strong> Ensures gas appliances are safe</p>
          <p><strong>Electrical Safety Standards 2020:</strong> Ensures electrical installations are safe</p>
          <p><strong>Energy Performance of Buildings Regulations:</strong> Environmental efficiency standards</p>
          <p><strong>Unfair Contract Terms Act 1977:</strong> Protects you from unfair tenancy terms</p>
        </div>
      </Card>

      {/* Contact & Support */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-blue-900">
          <p><strong>Deposit Dispute:</strong> Contact your protection scheme directly</p>
          <p><strong>Repairs:</strong> Report to your landlord or property manager through the maintenance request form</p>
          <p><strong>Rights Question:</strong> Visit gov.uk/private-renting or Citizens Advice</p>
          <p className="text-xs mt-3"><strong>Your landlord must:</strong> Respond to maintenance requests within reasonable time, allow access for safety checks with notice, return your deposit within 30 days of tenancy end</p>
        </div>
      </Card>
    </div>
  );
}