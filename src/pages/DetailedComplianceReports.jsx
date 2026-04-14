import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle, Clock, XCircle, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { format, isAfter, addDays, isBefore } from 'date-fns';

export default function DetailedComplianceReports() {
  const [reportType, setReportType] = useState('property-overview');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all required data
  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100),
  });

  const unitsQuery = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('-updated_date', 500),
  });

  const gasCertQuery = useQuery({
    queryKey: ['gas-certs'],
    queryFn: () => base44.entities.GasSafetyCertificate.list('-updated_date', 200),
  });

  const eicrCertQuery = useQuery({
    queryKey: ['eicr-certs'],
    queryFn: () => base44.entities.EICRCertificate.list('-updated_date', 200),
  });

  const depositProtectionQuery = useQuery({
    queryKey: ['deposits'],
    queryFn: () => base44.entities.DepositProtection.list('-updated_date', 200),
  });

  const rightToRentQuery = useQuery({
    queryKey: ['right-to-rent'],
    queryFn: () => base44.entities.RightToRentCheck.list('-updated_date', 200),
  });

  const inspectionRecordsQuery = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.InspectionRecord.list('-updated_date', 200),
  });

  const { data: properties = [] } = propertiesQuery;
  const { data: units = [] } = unitsQuery;
  const { data: gasCerts = [] } = gasCertQuery;
  const { data: eicrCerts = [] } = eicrCertQuery;
  const { data: deposits = [] } = depositProtectionQuery;
  const { data: rightToRent = [] } = rightToRentQuery;
  const { data: inspections = [] } = inspectionRecordsQuery;

  // Helper to determine certificate status
  const getCertificateStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (isAfter(today, expiry)) return { status: 'expired', label: 'Expired', color: 'text-red-600 bg-red-50 dark:bg-red-950' };
    if (daysUntilExpiry <= 30) return { status: 'expiring-soon', label: 'Expiring Soon', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950' };
    return { status: 'valid', label: 'Valid', color: 'text-green-600 bg-green-50 dark:bg-green-950' };
  };

  // Property Overview Report
  const propertyOverviewReport = useMemo(() => {
    const props = selectedProperty ? properties.filter(p => p.id === selectedProperty) : properties;
    
    return props.map(prop => {
      const propUnits = units.filter(u => u.property_id === prop.id);
      const propGasCerts = gasCerts.filter(g => g.property_id === prop.id);
      const propEicrCerts = eicrCerts.filter(e => e.property_id === prop.id);
      const propDeposits = deposits.filter(d => d.property_id === prop.id);
      const propRightToRent = rightToRent.filter(r => r.property_id === prop.id);
      const propInspections = inspections.filter(i => i.property_id === prop.id);

      const expiredGas = propGasCerts.filter(g => new Date(g.expiry_date) < new Date()).length;
      const expiredEicr = propEicrCerts.filter(e => new Date(e.next_due_date) < new Date()).length;
      const nonCompliantDeposits = propDeposits.filter(d => d.compliance_status !== 'compliant').length;

      return {
        propertyId: prop.id,
        propertyName: prop.name,
        totalUnits: propUnits.length,
        occupiedUnits: propUnits.filter(u => u.status === 'occupied').length,
        gasCertificates: propGasCerts.length,
        expiredGasCerts: expiredGas,
        eicrCertificates: propEicrCerts.length,
        expiredEicrCerts: expiredEicr,
        depositsManaged: propDeposits.length,
        nonCompliantDeposits,
        rightToRentChecks: propRightToRent.length,
        completedInspections: propInspections.length,
        overallCompliance: (propGasCerts.length > 0 && expiredGas === 0 && propEicrCerts.length > 0 && expiredEicr === 0 && nonCompliantDeposits === 0) ? 'compliant' : 'non-compliant',
      };
    });
  }, [properties, selectedProperty, units, gasCerts, eicrCerts, deposits, rightToRent, inspections]);

  // Certificate Audit Report
  const certificateAuditReport = useMemo(() => {
    const allCerts = [
      ...gasCerts.map(g => ({
        type: 'Gas Safety (CP12)',
        certificateNumber: g.certificate_number,
        propertyId: g.property_id,
        issueDate: g.issue_date,
        expiryDate: g.expiry_date,
        engineerName: g.engineer_name,
        status: getCertificateStatus(g.expiry_date),
      })),
      ...eicrCerts.map(e => ({
        type: 'Electrical (EICR)',
        certificateNumber: e.certificate_reference,
        propertyId: e.property_id,
        issueDate: e.inspection_date,
        expiryDate: e.next_due_date,
        engineerName: e.contractor_name,
        status: getCertificateStatus(e.next_due_date),
      })),
    ];

    return allCerts.filter(cert => {
      if (filterStatus === 'all') return true;
      return cert.status.status === filterStatus;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [gasCerts, eicrCerts, filterStatus]);

  // Deposit Protection Compliance Report
  const depositComplianceReport = useMemo(() => {
    return deposits.map(d => {
      const daysToProtect = d.days_to_protect || 0;
      const isLate = d.is_late || daysToProtect > 30;
      return {
        ...d,
        isLate,
        riskLevel: isLate ? 'high' : d.compliance_status === 'compliant' ? 'low' : 'medium',
      };
    }).filter(d => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'compliant') return d.compliance_status === 'compliant' && !d.isLate;
      if (filterStatus === 'at-risk') return d.isLate || d.compliance_status !== 'compliant';
      return true;
    });
  }, [deposits, filterStatus]);

  // Right to Rent Report
  const rightToRentReport = useMemo(() => {
    return rightToRent.map(rtr => {
      const followUpNeeded = rtr.follow_up_check_required && !rtr.follow_up_check_completed;
      return {
        ...rtr,
        followUpNeeded,
        status: rtr.check_result === 'pass' ? 'pass' : 'fail',
      };
    });
  }, [rightToRent]);

  const handleDownloadReport = () => {
    const reportData = {
      reportType,
      generatedDate: new Date().toISOString(),
      data: reportType === 'property-overview' ? propertyOverviewReport
           : reportType === 'certificates' ? certificateAuditReport
           : reportType === 'deposits' ? depositComplianceReport
           : rightToRentReport,
    };
    const element = document.createElement('a');
    element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    element.download = `compliance-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    element.click();
  };

  const propertyOptions = properties.map(p => ({ id: p.id, name: p.name }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader 
          title="Compliance Reports" 
          subtitle="Detailed compliance tracking and audit trails for property managers"
        >
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </PageHeader>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="property-overview">Property Overview</option>
                <option value="certificates">Certificate Audit</option>
                <option value="deposits">Deposit Protection</option>
                <option value="right-to-rent">Right to Rent</option>
              </select>
            </div>

            {reportType !== 'right-to-rent' && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Property</label>
                <select 
                  value={selectedProperty || ''}
                  onChange={(e) => setSelectedProperty(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">All Properties</option>
                  {propertyOptions.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(reportType === 'certificates' || reportType === 'deposits') && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Filter Status</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="all">All</option>
                  {reportType === 'certificates' && (
                    <>
                      <option value="valid">Valid Only</option>
                      <option value="expiring-soon">Expiring Soon</option>
                      <option value="expired">Expired</option>
                    </>
                  )}
                  {reportType === 'deposits' && (
                    <>
                      <option value="compliant">Compliant</option>
                      <option value="at-risk">At Risk</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Property Overview Report */}
        {reportType === 'property-overview' && (
          <div className="space-y-6">
            {propertyOverviewReport.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No properties found</div>
            ) : (
              propertyOverviewReport.map(prop => (
                <div key={prop.propertyId} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{prop.propertyName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prop.occupiedUnits} of {prop.totalUnits} units occupied
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                      prop.overallCompliance === 'compliant'
                        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                    }`}>
                      {prop.overallCompliance === 'compliant' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {prop.overallCompliance === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Gas Certificates</p>
                      <p className="text-2xl font-bold text-foreground">{prop.gasCertificates}</p>
                      {prop.expiredGasCerts > 0 && <p className="text-xs text-red-600 mt-1">{prop.expiredGasCerts} expired</p>}
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">EICR Certificates</p>
                      <p className="text-2xl font-bold text-foreground">{prop.eicrCertificates}</p>
                      {prop.expiredEicrCerts > 0 && <p className="text-xs text-red-600 mt-1">{prop.expiredEicrCerts} expired</p>}
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Deposits Managed</p>
                      <p className="text-2xl font-bold text-foreground">{prop.depositsManaged}</p>
                      {prop.nonCompliantDeposits > 0 && <p className="text-xs text-red-600 mt-1">{prop.nonCompliantDeposits} non-compliant</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Certificate Audit Report */}
        {reportType === 'certificates' && (
          <div className="space-y-3">
            {certificateAuditReport.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No certificates found</div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Certificate Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Cert #</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Engineer</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Expiry Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {certificateAuditReport.map((cert, i) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">{cert.type}</td>
                          <td className="px-4 py-3 font-mono text-xs">{cert.certificateNumber}</td>
                          <td className="px-4 py-3 text-xs">{cert.engineerName}</td>
                          <td className="px-4 py-3">{format(new Date(cert.expiryDate), 'dd MMM yyyy')}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${cert.status.color}`}>
                              {cert.status.status === 'valid' && <CheckCircle2 className="w-3 h-3" />}
                              {cert.status.status === 'expiring-soon' && <Clock className="w-3 h-3" />}
                              {cert.status.status === 'expired' && <XCircle className="w-3 h-3" />}
                              {cert.status.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deposit Protection Report */}
        {reportType === 'deposits' && (
          <div className="space-y-3">
            {depositComplianceReport.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No deposits found</div>
            ) : (
              depositComplianceReport.map((deposit) => (
                <div key={deposit.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Ref: {deposit.scheme_reference}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      £{deposit.deposit_amount} • Scheme: {deposit.scheme_name.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Protected: {format(new Date(deposit.protected_date), 'dd MMM yyyy')}
                      {deposit.isLate && ` (${deposit.days_to_protect} days - LATE)`}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${
                    deposit.riskLevel === 'low' ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : deposit.riskLevel === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                  }`}>
                    {deposit.riskLevel === 'low' && <CheckCircle2 className="w-3 h-3" />}
                    {deposit.riskLevel === 'medium' && <AlertCircle className="w-3 h-3" />}
                    {deposit.riskLevel === 'high' && <XCircle className="w-3 h-3" />}
                    {deposit.riskLevel === 'low' ? 'Compliant' : deposit.riskLevel === 'medium' ? 'At Risk' : 'Non-Compliant'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Right to Rent Report */}
        {reportType === 'right-to-rent' && (
          <div className="space-y-3">
            {rightToRentReport.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No Right to Rent checks found</div>
            ) : (
              rightToRentReport.map((rtr) => (
                <div key={rtr.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{rtr.tenant_full_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Document: {rtr.document_type.replace(/_/g, ' ')} • Check: {format(new Date(rtr.check_date), 'dd MMM yyyy')}
                      </p>
                      {rtr.followUpNeeded && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">⚠️ Follow-up check needed by {format(new Date(rtr.follow_up_check_date), 'dd MMM yyyy')}</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${
                      rtr.status === 'pass'
                        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                    }`}>
                      {rtr.status === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {rtr.status === 'pass' ? 'Pass' : 'Fail'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}