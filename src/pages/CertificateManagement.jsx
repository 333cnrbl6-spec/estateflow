import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, Upload, Filter, CheckCircle2, Clock, AlertCircle,
  Zap, FileText, Home
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function CertificateManagement() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: gasCerts = [] } = useQuery({
    queryKey: ['gasSafety'],
    queryFn: () => base44.entities.GasSafetyCertificate.list('-next_inspection_due', 100)
  });

  const { data: eicrCerts = [] } = useQuery({
    queryKey: ['eicr'],
    queryFn: () => base44.entities.EICRCertificate.list('-next_due_date', 100)
  });

  const { data: deposits = [] } = useQuery({
    queryKey: ['depositProtection'],
    queryFn: () => base44.entities.DepositProtection.list('-protected_date', 100)
  });

  const allCerts = useMemo(() => {
    const certs = [
      ...gasCerts.map(c => ({
        ...c,
        type: 'gas_safety',
        expiryDate: c.next_inspection_due,
        status: c.status || 'valid'
      })),
      ...eicrCerts.map(c => ({
        ...c,
        type: 'eicr',
        expiryDate: c.next_due_date,
        status: c.status || 'valid'
      })),
      ...deposits.map(c => ({
        ...c,
        type: 'deposit_protection',
        expiryDate: c.deposit_returned_date ? null : c.tenancy_end_date,
        status: c.compliance_status || 'compliant'
      }))
    ];

    return certs
      .filter(c => filterType === 'all' || c.type === filterType)
      .filter(c => filterStatus === 'all' || c.status === filterStatus)
      .sort((a, b) => new Date(a.expiryDate || '2099-01-01') - new Date(b.expiryDate || '2099-01-01'));
  }, [gasCerts, eicrCerts, deposits, filterType, filterStatus]);

  const daysUntil = (date) => {
    if (!date) return null;
    return differenceInDays(new Date(date), new Date());
  };

  const getStatusColor = (cert) => {
    const days = daysUntil(cert.expiryDate);
    if (!cert.expiryDate || days === null) return 'bg-green-50 border-green-200';
    if (days < 0) return 'bg-red-50 border-red-200';
    if (days < 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusIcon = (cert) => {
    const days = daysUntil(cert.expiryDate);
    if (!cert.expiryDate || days === null) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (days < 0) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (days < 30) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  };

  const stats = {
    total: allCerts.length,
    expired: allCerts.filter(c => {
      const days = daysUntil(c.expiryDate);
      return days !== null && days < 0;
    }).length,
    expiringSoon: allCerts.filter(c => {
      const days = daysUntil(c.expiryDate);
      return days !== null && days >= 0 && days < 30;
    }).length,
    valid: allCerts.filter(c => {
      const days = daysUntil(c.expiryDate);
      return days === null || days >= 30;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Certificate Management"
          subtitle="Track gas safety, electrical, and deposit protection certificates"
          icon={FileText}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Certificates</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-700 uppercase tracking-wider font-semibold mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-xs text-yellow-700 uppercase tracking-wider font-semibold mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wider font-semibold mb-1">Valid</p>
            <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              Certificate Type
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="gas_safety">Gas Safety (CP12)</option>
              <option value="eicr">Electrical (EICR)</option>
              <option value="deposit_protection">Deposit Protection</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Certificate
            </Button>
          </div>
        </div>

        {/* Certificate list */}
        <div className="space-y-2">
          {allCerts.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No certificates found</p>
            </div>
          ) : (
            allCerts.map(cert => (
              <div key={cert.id} className={`border rounded-lg p-4 ${getStatusColor(cert)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      {getStatusIcon(cert)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-sm text-foreground">
                          {cert.type === 'gas_safety' && `Gas Safety - ${cert.property_id}`}
                          {cert.type === 'eicr' && `Electrical (EICR) - ${cert.property_id}`}
                          {cert.type === 'deposit_protection' && `Deposit Protection - ${cert.tenancy_id}`}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-foreground font-medium">
                          {cert.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {cert.certificate_number && <p>Cert: {cert.certificate_number}</p>}
                        {cert.engineer_name && <p>Inspector: {cert.engineer_name}</p>}
                        {cert.expiryDate && (
                          <p>
                            Expires: {format(new Date(cert.expiryDate), 'dd MMM yyyy')}
                            {(() => {
                              const days = daysUntil(cert.expiryDate);
                              if (days === null) return ' (completed)';
                              if (days < 0) return ` (${Math.abs(days)} days overdue)`;
                              return ` (${days} days remaining)`;
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}