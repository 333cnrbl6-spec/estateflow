import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle2, AlertCircle, Shield, FileText, Home, User, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function ComplianceDashboard2() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch all compliance data
  const { data: gasCerts = [] } = useQuery({
    queryKey: ['gasCertificates'],
    queryFn: () => base44.entities.GasSafetyCertificate.list(),
    initialData: [],
  });

  const { data: eicrCerts = [] } = useQuery({
    queryKey: ['eicrCertificates'],
    queryFn: () => base44.entities.EICRCertificate.list(),
    initialData: [],
  });

  const { data: deposits = [] } = useQuery({
    queryKey: ['depositProtections'],
    queryFn: () => base44.entities.DepositProtection.list(),
    initialData: [],
  });

  const { data: rtrChecks = [] } = useQuery({
    queryKey: ['rightToRentChecks'],
    queryFn: () => base44.entities.RightToRentCheck.list(),
    initialData: [],
  });

  const { data: buildingSafety = [] } = useQuery({
    queryKey: ['buildingSafety'],
    queryFn: () => base44.entities.BuildingSafety.list(),
    initialData: [],
  });

  const { data: safetyCerts = [] } = useQuery({
    queryKey: ['safetyCertificates'],
    queryFn: () => base44.entities.SafetyCertificate.list(),
    initialData: [],
  });

  // Calculate compliance metrics
  const complianceMetrics = useMemo(() => {
    const today = new Date();
    
    const metrics = {
      gas_safety: { total: gasCerts.length, compliant: 0, expiring: 0, expired: 0, penalty_exposure: 0 },
      eicr: { total: eicrCerts.length, compliant: 0, expiring: 0, expired: 0, remedial_overdue: 0, penalty_exposure: 0 },
      deposits: { total: deposits.length, compliant: 0, late: 0, not_protected: 0, penalty_exposure: 0 },
      right_to_rent: { total: rtrChecks.length, compliant: 0, followup_due: 0, visa_expiring: 0, penalty_exposure: 0 },
      fire_safety: { total: buildingSafety.length, compliant: 0, overdue: 0, expiring: 0, penalty_exposure: 0 },
      certificates: { total: safetyCerts.length, compliant: 0, expiring: 0, expired: 0, penalty_exposure: 0 },
    };

    // Gas Safety
    gasCerts.forEach(cert => {
      if (!cert.expiry_date) return;
      const daysUntil = (new Date(cert.expiry_date) - today) / (1000 * 60 * 60 * 24);
      if (daysUntil < 0) {
        metrics.gas_safety.expired++;
        metrics.gas_safety.penalty_exposure += 7000;
      } else if (daysUntil <= 30) {
        metrics.gas_safety.expiring++;
      } else {
        metrics.gas_safety.compliant++;
      }
    });

    // EICR
    eicrCerts.forEach(cert => {
      if (!cert.next_due_date) return;
      const daysUntil = (new Date(cert.next_due_date) - today) / (1000 * 60 * 60 * 24);
      if (daysUntil < 0) {
        metrics.eicr.expired++;
        metrics.eicr.penalty_exposure += 30000;
      } else if (daysUntil <= 90) {
        metrics.eicr.expiring++;
      } else {
        metrics.eicr.compliant++;
      }
      
      if (cert.remedial_work_required && cert.remedial_work_deadline && !cert.remedial_completion_date) {
        const daysUntilDeadline = (new Date(cert.remedial_work_deadline) - today) / (1000 * 60 * 60 * 24);
        if (daysUntilDeadline < 0) {
          metrics.eicr.remedial_overdue++;
        }
      }
    });

    // Deposits
    deposits.forEach(deposit => {
      if (!deposit.deposit_received_date) return;
      const daysSince = (today - new Date(deposit.deposit_received_date)) / (1000 * 60 * 60 * 24);
      
      if (!deposit.protected_date && daysSince > 30) {
        metrics.deposits.not_protected++;
        metrics.deposits.penalty_exposure += (deposit.deposit_amount * 3);
      } else if (deposit.is_late) {
        metrics.deposits.late++;
      } else {
        metrics.deposits.compliant++;
      }
    });

    // Right to Rent
    rtrChecks.forEach(check => {
      if (check.follow_up_check_required && check.follow_up_check_date && !check.follow_up_check_completed) {
        const daysUntil = (new Date(check.follow_up_check_date) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil < 0) {
          metrics.right_to_rent.followup_due++;
          metrics.right_to_rent.penalty_exposure += 10000;
        } else if (daysUntil <= 14) {
          metrics.right_to_rent.followup_due++;
        } else {
          metrics.right_to_rent.compliant++;
        }
      } else {
        metrics.right_to_rent.compliant++;
      }
      
      if (check.document_expiry_date) {
        const daysUntil = (new Date(check.document_expiry_date) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil < 0) {
          metrics.right_to_rent.visa_expiring++;
        } else if (daysUntil <= 60) {
          metrics.right_to_rent.visa_expiring++;
        }
      }
    });

    // Fire Safety
    buildingSafety.forEach(bs => {
      const nextDue = bs.fire_safety?.fire_risk_assessment?.next_assessment_due;
      if (nextDue) {
        const daysUntil = (new Date(nextDue) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil < 0) {
          metrics.fire_safety.overdue++;
          metrics.fire_safety.penalty_exposure += 10000;
        } else if (daysUntil <= 30) {
          metrics.fire_safety.expiring++;
        } else {
          metrics.fire_safety.compliant++;
        }
      } else {
        metrics.fire_safety.compliant++;
      }
    });

    // Certificates
    safetyCerts.forEach(cert => {
      if (!cert.expiry_date) return;
      const daysUntil = (new Date(cert.expiry_date) - today) / (1000 * 60 * 60 * 24);
      if (daysUntil < 0) {
        metrics.certificates.expired++;
      } else if (daysUntil <= 30) {
        metrics.certificates.expiring++;
      } else {
        metrics.certificates.compliant++;
      }
    });

    return metrics;
  }, [gasCerts, eicrCerts, deposits, rtrChecks, buildingSafety, safetyCerts]);

  // Calculate overall compliance score
  const overallScore = useMemo(() => {
    let totalItems = 0;
    let compliantItems = 0;
    
    Object.values(complianceMetrics).forEach(metric => {
      totalItems += metric.total || 0;
      compliantItems += metric.compliant || 0;
    });
    
    return totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;
  }, [complianceMetrics]);

  // Calculate total penalty exposure
  const totalPenaltyExposure = useMemo(() => {
    return Object.values(complianceMetrics).reduce((sum, m) => sum + (m.penalty_exposure || 0), 0);
  }, [complianceMetrics]);

  // Get issues list
  const issues = useMemo(() => {
    const today = new Date();
    const issues = [];

    gasCerts.forEach(cert => {
      if (cert.expiry_date) {
        const daysUntil = (new Date(cert.expiry_date) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil < 0) {
          issues.push({ type: 'Gas Safety', severity: 'critical', title: 'Certificate Expired', details: `Expired ${Math.abs(daysUntil)} days ago`, property: cert.property_id });
        } else if (daysUntil <= 30) {
          issues.push({ type: 'Gas Safety', severity: 'warning', title: 'Certificate Expiring Soon', details: `${daysUntil} days remaining`, property: cert.property_id });
        }
      }
    });

    eicrCerts.forEach(cert => {
      if (cert.next_due_date) {
        const daysUntil = (new Date(cert.next_due_date) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil < 0) {
          issues.push({ type: 'EICR', severity: 'critical', title: 'Certificate Expired', details: `Expired ${Math.abs(daysUntil)} days ago`, property: cert.property_id });
        } else if (daysUntil <= 90) {
          issues.push({ type: 'EICR', severity: 'warning', title: 'Certificate Due Soon', details: `${daysUntil} days until due`, property: cert.property_id });
        }
      }
    });

    return issues;
  }, [gasCerts, eicrCerts]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getComplianceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Compliance Dashboard 2.0</h1>
          <p className="text-muted-foreground mt-1">Unified compliance monitoring across all legislation areas</p>
        </div>
        <Button className="gap-2">
          <Shield className="w-4 h-4" />
          Run Compliance Check
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overall Compliance Score</CardTitle>
          <CardDescription>Weighted average across all compliance areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`text-6xl font-bold ${getComplianceColor(overallScore)}`}>
              {overallScore}%
            </div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Critical Issues: {issues.filter(i => i.severity === 'critical').length}</span>
                <span>Warnings: {issues.filter(i => i.severity === 'warning').length}</span>
              </div>
            </div>
            {totalPenaltyExposure > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Potential Penalty Exposure</p>
                <p className="text-2xl font-bold text-red-600">£{totalPenaltyExposure.toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance by Area */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gas">Gas Safety</TabsTrigger>
          <TabsTrigger value="eicr">EICR</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="rtr">Right to Rent</TabsTrigger>
          <TabsTrigger value="fire">Fire Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gas Safety */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Gas Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.gas_safety.compliant}/{complianceMetrics.gas_safety.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceMetrics.gas_safety.expired > 0 && <span className="text-red-600 font-semibold">{complianceMetrics.gas_safety.expired} expired • </span>}
                  {complianceMetrics.gas_safety.expiring > 0 && <span className="text-amber-600">{complianceMetrics.gas_safety.expiring} expiring</span>}
                </p>
              </CardContent>
            </Card>

            {/* EICR */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  EICR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.eicr.compliant}/{complianceMetrics.eicr.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceMetrics.eicr.expired > 0 && <span className="text-red-600 font-semibold">{complianceMetrics.eicr.expired} expired • </span>}
                  {complianceMetrics.eicr.expiring > 0 && <span className="text-amber-600">{complianceMetrics.eicr.expiring} due soon</span>}
                </p>
              </CardContent>
            </Card>

            {/* Deposits */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Deposit Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.deposits.compliant}/{complianceMetrics.deposits.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceMetrics.deposits.not_protected > 0 && <span className="text-red-600 font-semibold">{complianceMetrics.deposits.not_protected} not protected</span>}
                </p>
              </CardContent>
            </Card>

            {/* Right to Rent */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Right to Rent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.right_to_rent.compliant}/{complianceMetrics.right_to_rent.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceMetrics.right_to_rent.followup_due > 0 && <span className="text-amber-600">{complianceMetrics.right_to_rent.followup_due} follow-ups due</span>}
                </p>
              </CardContent>
            </Card>

            {/* Fire Safety */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Fire Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.fire_safety.compliant}/{complianceMetrics.fire_safety.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceMetrics.fire_safety.overdue > 0 && <span className="text-red-600 font-semibold">{complianceMetrics.fire_safety.overdue} overdue</span>}
                </p>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Safety Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceMetrics.certificates.compliant}/{complianceMetrics.certificates.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceMetrics.certificates.expired > 0 && <span className="text-red-600 font-semibold">{complianceMetrics.certificates.expired} expired • </span>}
                  {complianceMetrics.certificates.expiring > 0 && <span className="text-amber-600">{complianceMetrics.certificates.expiring} expiring</span>}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Compliance Issues</CardTitle>
              <CardDescription>{issues.length} issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length > 0 ? (
                <div className="space-y-2">
                  {issues.slice(0, 10).map((issue, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {issue.severity === 'critical' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                          )}
                          <div>
                            <p className="font-semibold text-sm">{issue.title}</p>
                            <p className="text-xs">{issue.type} • {issue.details}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{issue.property}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <p>No active compliance issues</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gas">
          <Card>
            <CardHeader>
              <CardTitle>Gas Safety Compliance</CardTitle>
              <CardDescription>{complianceMetrics.gas_safety.total} certificates tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Gas Safety module content - list of all certificates with status</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eicr">
          <Card>
            <CardHeader>
              <CardTitle>EICR Compliance</CardTitle>
              <CardDescription>{complianceMetrics.eicr.total} certificates tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p>EICR module content - list of all certificates with remedial tracking</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Protection Compliance</CardTitle>
              <CardDescription>{complianceMetrics.deposits.total} deposits tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Deposit Protection module content - compliance status and deadlines</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rtr">
          <Card>
            <CardHeader>
              <CardTitle>Right to Rent Compliance</CardTitle>
              <CardDescription>{complianceMetrics.right_to_rent.total} checks tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Right to Rent module content - initial and follow-up checks</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fire">
          <Card>
            <CardHeader>
              <CardTitle>Fire Safety Compliance</CardTitle>
              <CardDescription>{complianceMetrics.fire_safety.total} buildings tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Fire Safety module content - risk assessments and deadlines</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}