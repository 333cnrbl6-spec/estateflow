import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Shield, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PropertyComplianceStatus({ properties, certificates, deposits }) {
  const propertyCompliance = useMemo(() => {
    return properties?.map(prop => {
      const propCerts = certificates?.filter(c => c.property_id === prop.id) || [];
      const propDeposits = deposits?.filter(d => d.property_id === prop.id) || [];

      const now = new Date();
      const certStatus = propCerts.map(cert => {
        if (!cert.expiry_date) return 'unknown';
        const daysUntil = Math.floor((new Date(cert.expiry_date) - now) / (1000 * 60 * 60 * 24));
        return daysUntil < 0 ? 'overdue' : daysUntil <= 30 ? 'expiring' : 'valid';
      });

      const gasValid = propCerts.some(c => c.certificate_number && certStatus[propCerts.indexOf(c)] === 'valid');
      const eicrsValid = propCerts.some(c => c.certificate_reference && certStatus[propCerts.indexOf(c)] === 'valid');
      const depositsCompliant = propDeposits.every(d => d.compliance_status === 'compliant');

      const overallStatus = certStatus.includes('overdue') || !depositsCompliant
        ? 'critical'
        : certStatus.includes('expiring')
          ? 'warning'
          : 'compliant';

      return {
        id: prop.id,
        name: prop.name,
        gasValid,
        eicrsValid,
        depositsCompliant,
        depositCount: propDeposits.length,
        certCount: propCerts.length,
        overallStatus,
      };
    }) || [];
  }, [properties, certificates, deposits]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">At Risk</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-700">Review Needed</Badge>;
      case 'compliant':
        return <Badge className="bg-green-100 text-green-700">Compliant</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Gas Safety</TableHead>
                <TableHead>EICR</TableHead>
                <TableHead>Deposits Protected</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyCompliance.map(prop => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium">{prop.name}</TableCell>
                  <TableCell>
                    {prop.gasValid ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> Valid
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" /> Missing
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {prop.eicrsValid ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> Valid
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" /> Missing
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {prop.depositCount === 0 ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : prop.depositsCompliant ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Lock className="w-4 h-4" /> {prop.depositCount} Compliant
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" /> {prop.depositCount} At Risk
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(prop.overallStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}