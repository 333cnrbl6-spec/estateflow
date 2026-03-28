import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Shield, DollarSign, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function BlockManagementComplianceDashboard() {
  const { data: buildingSafety } = useQuery({
    queryKey: ['buildingSafety'],
    queryFn: () => base44.entities.BuildingSafety.list(),
    initialData: [],
  });

  const { data: serviceCharges } = useQuery({
    queryKey: ['serviceCharges'],
    queryFn: () => base44.entities.ServiceCharge.list(),
    initialData: [],
  });

  const { data: clientMoney } = useQuery({
    queryKey: ['clientMoneyProtection'],
    queryFn: () => base44.entities.ClientMoneyProtection.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  // Calculate compliance metrics
  const complianceMetrics = useMemo(() => {
    const today = new Date();
    const alerts = [];

    // Fire Risk Assessment Overdue
    const fireAssessmentOverdue = buildingSafety.filter(bs => {
      const nextDue = bs.fire_safety?.fire_risk_assessment?.next_assessment_due;
      return nextDue && new Date(nextDue) < today;
    });

    // EICR Overdue
    const eicirOverdue = buildingSafety.filter(bs => {
      const nextDue = bs.electrical_safety_eicr?.next_eicr_due;
      return nextDue && new Date(nextDue) < today;
    });

    // Asbestos Survey Overdue
    const asbestosOverdue = buildingSafety.filter(bs => {
      const nextDue = bs.asbestos_management?.next_survey_due;
      return nextDue && new Date(nextDue) < today;
    });

    // Legionella Risk Assessment Overdue
    const legionellaOverdue = buildingSafety.filter(bs => {
      const nextDue = bs.legionella_risk_assessment?.next_assessment_due;
      return nextDue && new Date(nextDue) < today;
    });

    // Accountable Person Missing (HRRB)
    const accountablePersonMissing = buildingSafety.filter(bs => 
      bs.building_classification?.in_scope_building_safety_act && !bs.accountable_person?.appointed
    );

    // s.20 Consultation Deadlines (within 30 days)
    const s20Deadlines = serviceCharges.filter(sc => {
      const deadline = sc.section_20_deadline;
      if (!deadline) return false;
      const daysUntil = (new Date(deadline) - today) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30 && sc.section_20_status !== 'leaseholder_consent_obtained';
    });

    // CMP Reconciliation Issues
    const cmpIssues = clientMoney.filter(cmp => {
      const lastReconciliation = cmp.account_reconciliation?.[0];
      if (!lastReconciliation) return true;
      const daysSinceReconcile = (today - new Date(lastReconciliation.reconciliation_date)) / (1000 * 60 * 60 * 24);
      return daysSinceReconcile > 31 || lastReconciliation.reconciliation_status === 'unbalanced';
    });

    // Structural Defects Unresolved (7+ storey buildings)
    const unresolvedDefects = buildingSafety.filter(bs => 
      bs.building_classification?.in_scope_building_safety_act &&
      bs.structural_safety?.structural_defect_register?.some(d => !d.completed)
    );

    // Leaseholder Statements Not Sent
    const missedStatements = serviceCharges.filter(sc => 
      !sc.leaseholder_statement_sent && new Date(sc.period_end) < today
    );

    return {
      fireAssessmentOverdue: fireAssessmentOverdue.length,
      eicirOverdue: eicirOverdue.length,
      asbestosOverdue: asbestosOverdue.length,
      legionellaOverdue: legionellaOverdue.length,
      accountablePersonMissing: accountablePersonMissing.length,
      s20Deadlines: s20Deadlines.length,
      cmpIssues: cmpIssues.length,
      unresolvedDefects: unresolvedDefects.length,
      missedStatements: missedStatements.length,
      totalAlerts: 
        fireAssessmentOverdue.length +
        eicirOverdue.length +
        asbestosOverdue.length +
        accountablePersonMissing.length +
        s20Deadlines.length +
        cmpIssues.length +
        unresolvedDefects.length +
        missedStatements.length,
    };
  }, [buildingSafety, serviceCharges, clientMoney]);

  // Upcoming deadlines for timeline
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const deadlines = [];

    // Fire assessments due in next 90 days
    buildingSafety.forEach(bs => {
      const nextDue = bs.fire_safety?.fire_risk_assessment?.next_assessment_due;
      if (nextDue) {
        const daysUntil = (new Date(nextDue) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil >= 0 && daysUntil <= 90) {
          deadlines.push({
            type: 'Fire Assessment',
            daysUntil: Math.round(daysUntil),
            date: nextDue,
            property: properties.find(p => p.id === bs.property_id)?.name || 'Unknown',
            status: daysUntil < 0 ? 'overdue' : daysUntil < 14 ? 'urgent' : 'upcoming',
          });
        }
      }
    });

    // EICR due in next 90 days
    buildingSafety.forEach(bs => {
      const nextDue = bs.electrical_safety_eicr?.next_eicr_due;
      if (nextDue) {
        const daysUntil = (new Date(nextDue) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil >= 0 && daysUntil <= 90) {
          deadlines.push({
            type: 'EICR',
            daysUntil: Math.round(daysUntil),
            date: nextDue,
            property: properties.find(p => p.id === bs.property_id)?.name || 'Unknown',
            status: daysUntil < 0 ? 'overdue' : daysUntil < 14 ? 'urgent' : 'upcoming',
          });
        }
      }
    });

    // s.20 Deadlines
    serviceCharges.forEach(sc => {
      const deadline = sc.section_20_deadline;
      if (deadline && sc.section_20_status !== 'leaseholder_consent_obtained') {
        const daysUntil = (new Date(deadline) - today) / (1000 * 60 * 60 * 24);
        if (daysUntil >= 0 && daysUntil <= 90) {
          deadlines.push({
            type: 's.20 Consultation',
            daysUntil: Math.round(daysUntil),
            date: deadline,
            property: properties.find(p => p.id === sc.property_id)?.name || 'Unknown',
            status: daysUntil < 0 ? 'overdue' : daysUntil < 14 ? 'urgent' : 'upcoming',
          });
        }
      }
    });

    return deadlines.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 10);
  }, [buildingSafety, serviceCharges, properties]);

  // Compliance score by property
  const complianceByProperty = useMemo(() => {
    return properties.slice(0, 10).map(prop => {
      const bsSafety = buildingSafety.filter(bs => bs.property_id === prop.id);
      const scCharges = serviceCharges.filter(sc => sc.property_id === prop.id);

      let score = 100;
      
      // Deduct for fire assessment overdue
      if (bsSafety.some(bs => {
        const nextDue = bs.fire_safety?.fire_risk_assessment?.next_assessment_due;
        return nextDue && new Date(nextDue) < new Date();
      })) score -= 10;

      // Deduct for EICR overdue
      if (bsSafety.some(bs => {
        const nextDue = bs.electrical_safety_eicr?.next_eicr_due;
        return nextDue && new Date(nextDue) < new Date();
      })) score -= 10;

      // Deduct for missing accountable person
      if (bsSafety.some(bs => 
        bs.building_classification?.in_scope_building_safety_act && !bs.accountable_person?.appointed
      )) score -= 15;

      // Deduct for s.20 issues
      if (scCharges.some(sc => sc.section_20_status === 'dispute_filed')) score -= 10;

      return {
        name: prop.name,
        score: Math.max(0, score),
      };
    });
  }, [properties, buildingSafety, serviceCharges]);

  // CMP Status Summary
  const cmpStatus = useMemo(() => {
    const today = new Date();
    let totalHeld = 0;
    let lastReconciled = null;
    let unbalancedCount = 0;

    clientMoney.forEach(cmp => {
      // Sum money held
      cmp.money_held?.forEach(item => {
        totalHeld += item.amount || 0;
      });

      // Find most recent reconciliation
      if (cmp.account_reconciliation?.length > 0) {
        const latest = cmp.account_reconciliation[0];
        const reconcileDate = new Date(latest.reconciliation_date);
        if (!lastReconciled || reconcileDate > lastReconciled) {
          lastReconciled = reconcileDate;
        }

        if (latest.reconciliation_status === 'unbalanced') {
          unbalancedCount++;
        }
      }
    });

    const daysSinceReconciled = lastReconciled 
      ? Math.floor((today - lastReconciled) / (1000 * 60 * 60 * 24))
      : null;

    return {
      totalHeld,
      daysSinceReconciled,
      lastReconciled,
      unbalancedCount,
      isOverdue: daysSinceReconciled && daysSinceReconciled > 31,
    };
  }, [clientMoney]);

  const alertSeverity = (count, critical = 3, warning = 1) => {
    if (count >= critical) return 'critical';
    if (count >= warning) return 'warning';
    return 'success';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-900';
      case 'warning': return 'bg-amber-100 border-amber-300 text-amber-900';
      default: return 'bg-green-100 border-green-300 text-green-900';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Block Management Compliance</h1>
        <p className="text-muted-foreground mt-1">Real-time compliance status, deadlines, and safety alerts</p>
      </div>

      {/* Critical Alerts Section */}
      {complianceMetrics.totalAlerts > 0 && (
        <Card className={`border-2 ${getSeverityColor(alertSeverity(complianceMetrics.totalAlerts, 10, 5))}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {getSeverityIcon(alertSeverity(complianceMetrics.totalAlerts, 10, 5))}
              <CardTitle>Active Compliance Alerts</CardTitle>
              <Badge className="ml-auto text-lg">{complianceMetrics.totalAlerts}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {complianceMetrics.fireAssessmentOverdue > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900">Fire Assessments</p>
                  <p className="text-2xl font-bold text-red-700">{complianceMetrics.fireAssessmentOverdue}</p>
                  <p className="text-xs text-red-600">Overdue</p>
                </div>
              )}
              {complianceMetrics.eicirOverdue > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900">EICR</p>
                  <p className="text-2xl font-bold text-red-700">{complianceMetrics.eicirOverdue}</p>
                  <p className="text-xs text-red-600">Overdue</p>
                </div>
              )}
              {complianceMetrics.accountablePersonMissing > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900">HRRB</p>
                  <p className="text-2xl font-bold text-red-700">{complianceMetrics.accountablePersonMissing}</p>
                  <p className="text-xs text-red-600">No Accountable Person</p>
                </div>
              )}
              {complianceMetrics.s20Deadlines > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-semibold text-amber-900">s.20</p>
                  <p className="text-2xl font-bold text-amber-700">{complianceMetrics.s20Deadlines}</p>
                  <p className="text-xs text-amber-600">Due within 30 days</p>
                </div>
              )}
              {complianceMetrics.cmpIssues > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900">CMP</p>
                  <p className="text-2xl font-bold text-red-700">{complianceMetrics.cmpIssues}</p>
                  <p className="text-xs text-red-600">Reconciliation Issues</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Fire Safety Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{buildingSafety.length}</div>
            <p className={`text-sm mt-1 ${complianceMetrics.fireAssessmentOverdue > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
              {complianceMetrics.fireAssessmentOverdue > 0 
                ? `${complianceMetrics.fireAssessmentOverdue} overdue` 
                : 'All current'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              EICR Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {buildingSafety.filter(bs => bs.electrical_safety_eicr?.eicr_date).length}
            </div>
            <p className={`text-sm mt-1 ${complianceMetrics.eicirOverdue > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
              {complianceMetrics.eicirOverdue > 0 
                ? `${complianceMetrics.eicirOverdue} overdue` 
                : 'All current'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              CMP Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">£{(cmpStatus.totalHeld / 1000).toFixed(0)}k</div>
            <p className={`text-sm mt-1 ${cmpStatus.isOverdue ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
              {cmpStatus.daysSinceReconciled !== null 
                ? `Reconciled ${cmpStatus.daysSinceReconciled} days ago` 
                : 'No reconciliation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              s.20 Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{complianceMetrics.s20Deadlines}</div>
            <p className="text-sm mt-1 text-amber-600">
              {complianceMetrics.s20Deadlines > 0 ? 'Within 30 days' : 'None due'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Score by Property */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score by Property</CardTitle>
            <CardDescription>Current compliance status across portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceByProperty}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#0000ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Next 10 Compliance Deadlines</CardTitle>
            <CardDescription>Upcoming assessments and consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      deadline.status === 'overdue'
                        ? 'bg-red-50 border-red-300'
                        : deadline.status === 'urgent'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{deadline.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{deadline.property}</p>
                      </div>
                      <Badge
                        className={
                          deadline.status === 'overdue'
                            ? 'bg-red-600'
                            : deadline.status === 'urgent'
                            ? 'bg-amber-600'
                            : 'bg-blue-600'
                        }
                      >
                        {deadline.daysUntil <= 0 ? 'OVERDUE' : `${deadline.daysUntil}d`}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">No deadlines due in next 90 days</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fire Safety & Structural */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Fire & Structural Safety</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">Fire Risk Assessments (HRRB)</span>
                  <span className={`text-sm font-semibold ${complianceMetrics.fireAssessmentOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {buildingSafety.filter(bs => bs.fire_safety?.fire_risk_assessment?.last_assessment_date).length}/{buildingSafety.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">EICR Tests (5-year cycle)</span>
                  <span className={`text-sm font-semibold ${complianceMetrics.eicirOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {buildingSafety.filter(bs => bs.electrical_safety_eicr?.eicr_date).length}/{buildingSafety.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">Accountable Persons (HRRB)</span>
                  <span className={`text-sm font-semibold ${complianceMetrics.accountablePersonMissing > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {buildingSafety.filter(bs => 
                      !bs.building_classification?.in_scope_building_safety_act || bs.accountable_person?.appointed
                    ).length}/{buildingSafety.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial & Legal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Financial & Legal Compliance</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">Service Charges (Active)</span>
                  <span className="text-sm font-semibold text-blue-600">{serviceCharges.filter(sc => sc.status !== 'archived').length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">s.20 Consultations (Current)</span>
                  <span className={`text-sm font-semibold ${complianceMetrics.s20Deadlines > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {serviceCharges.filter(sc => sc.section_20_status === 'consultation_period').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="text-sm">CMP Accounts (Active)</span>
                  <span className={`text-sm font-semibold ${cmpStatus.unbalancedCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {clientMoney.filter(cmp => cmp.cmp_scheme.membership_active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}