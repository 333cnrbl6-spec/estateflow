import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function CertificateStatus({ certificate, certificateType }) {
  const getExpirationStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', daysLeft, label: 'Expired' };
    if (daysLeft <= 30) return { status: 'expiring_soon', daysLeft, label: `${daysLeft} days left` };
    return { status: 'valid', daysLeft, label: `${daysLeft} days left` };
  };

  const expiryDate = certificate.expiry_date || certificate.valid_until || certificate.next_review_due;
  const { status, label, daysLeft } = getExpirationStatus(expiryDate);

  const typeLabels = {
    gas_safety: 'Gas Safety Certificate',
    electrical: 'Electrical Certificate (EICR)',
    fire_safety: 'Fire Risk Assessment'
  };

  const statusColors = {
    valid: 'bg-green-100 text-green-700',
    expiring_soon: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    valid: <CheckCircle2 className="w-4 h-4" />,
    expiring_soon: <Clock className="w-4 h-4" />,
    expired: <AlertCircle className="w-4 h-4" />
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{typeLabels[certificateType]}</h3>
          {certificate.certificate_number && (
            <p className="text-xs text-muted-foreground mt-1">Ref: {certificate.certificate_number}</p>
          )}
        </div>
        <Badge className={statusColors[status]} variant="outline">
          {statusIcons[status]}
          <span className="ml-1">{label}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
        <div>
          <p className="text-muted-foreground">Issue Date</p>
          <p className="font-medium text-foreground">
            {certificate.assessment_date || certificate.issue_date
              ? new Date(certificate.assessment_date || certificate.issue_date).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Expiry Date</p>
          <p className={`font-medium ${status === 'expired' ? 'text-red-600' : 'text-foreground'}`}>
            {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {certificateType === 'gas_safety' && certificate.assessor_name && (
        <p className="text-xs text-muted-foreground mt-2">Assessor: {certificate.assessor_name}</p>
      )}
      {certificateType === 'electrical' && certificate.assessor_name && (
        <p className="text-xs text-muted-foreground mt-2">Inspector: {certificate.assessor_name}</p>
      )}
      {certificateType === 'fire_safety' && certificate.assessor_name && (
        <p className="text-xs text-muted-foreground mt-2">Assessor: {certificate.assessor_name}</p>
      )}
    </Card>
  );
}