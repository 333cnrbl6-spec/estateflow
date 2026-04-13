import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ComplianceMetrics({ certificates, deposits, properties }) {
  const metrics = useMemo(() => {
    const now = new Date();
    let overdue = 0, expiringSoon = 0, valid = 0;
    let depositValid = 0, depositExpiring = 0;

    // Analyze certificates
    certificates?.forEach(cert => {
      if (!cert.expiry_date) return;
      const expiryDate = new Date(cert.expiry_date);
      const daysUntil = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) overdue++;
      else if (daysUntil <= 30) expiringSoon++;
      else valid++;
    });

    // Analyze deposits
    deposits?.forEach(deposit => {
      if (deposit.compliance_status === 'compliant') depositValid++;
      else if (deposit.compliance_status === 'late_protection') depositExpiring++;
    });

    return {
      totalCerts: certificates?.length || 0,
      overdue,
      expiringSoon,
      valid,
      totalProperties: properties?.length || 0,
      depositValid,
      depositExpiring,
    };
  }, [certificates, deposits, properties]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{metrics.totalProperties}</div>
          <p className="text-xs text-muted-foreground mt-1">Under management</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Valid Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{metrics.valid}</div>
          <p className="text-xs text-muted-foreground mt-1">of {metrics.totalCerts} total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">{metrics.expiringSoon}</div>
          <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{metrics.overdue}</div>
          <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
        </CardContent>
      </Card>
    </div>
  );
}