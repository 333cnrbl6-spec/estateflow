import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Building2, Shield, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlockManagement() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const { data: serviceCharges } = useQuery({
    queryKey: ['serviceCharges'],
    queryFn: () => base44.entities.ServiceCharge.list(),
    initialData: [],
  });

  const { data: rtmRecords } = useQuery({
    queryKey: ['rtmManagement'],
    queryFn: () => base44.entities.RTMManagement.list(),
    initialData: [],
  });

  const { data: buildingSafety } = useQuery({
    queryKey: ['buildingSafety'],
    queryFn: () => base44.entities.BuildingSafety.list(),
    initialData: [],
  });

  // Calculate key metrics
  const activeServiceCharges = serviceCharges.filter(sc => sc.status !== 'archived').length;
  const rtmInProgress = rtmRecords.filter(r => r.rtm_status !== 'traditional_management' && r.rtm_status !== 'rtm_acquired').length;
  const hrrbs = buildingSafety.filter(bs => bs.building_classification?.in_scope_building_safety_act).length;
  const accountablePersonsRequired = buildingSafety.filter(bs => bs.building_classification?.in_scope_building_safety_act && !bs.accountable_person?.appointed).length;

  // Compliance alerts
  const alerts = [
    ...serviceCharges
      .filter(sc => sc.section_20_status === 'notice_issued' || sc.section_20_status === 'consultation_period')
      .map(sc => ({
        id: sc.id,
        type: 'section20',
        level: 'warning',
        title: `s.20 Consultation In Progress`,
        property: properties.find(p => p.id === sc.property_id)?.name,
        deadline: sc.section_20_deadline,
      })),
    ...rtmRecords
      .filter(r => r.rtm_status === 'dispute_period' || r.rtm_status === 'notice_served')
      .map(r => ({
        id: r.id,
        type: 'rtm',
        level: 'warning',
        title: `RTM Claim In Progress`,
        property: properties.find(p => p.id === r.property_id)?.name,
        deadline: r.rtm_company_details?.formed_date,
      })),
    ...buildingSafety
      .filter(bs => bs.building_classification?.in_scope_building_safety_act && !bs.accountable_person?.appointed)
      .map(bs => ({
        id: bs.id,
        type: 'accountable_person',
        level: 'critical',
        title: `Accountable Person Not Appointed (HRRB)`,
        property: properties.find(p => p.id === bs.property_id)?.name,
        deadline: null,
      })),
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-background space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Block Management</h1>
        <p className="text-muted-foreground">Service charges, RTM tracking, and Building Safety compliance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Service Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeServiceCharges}</div>
            <p className="text-xs text-muted-foreground mt-1">Accounts under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">RTM In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{rtmInProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Claims/notices active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">HRRB Buildings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{hrrbs}</div>
            <p className="text-xs text-muted-foreground mt-1">7+ storeys in scope</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{accountablePersonsRequired}</div>
            <p className="text-xs text-muted-foreground mt-1">Accountable persons missing</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <CardTitle>Compliance Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start justify-between p-3 rounded-lg border ${
                    alert.level === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-amber-200'
                  }`}
                >
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        alert.level === 'critical' ? 'text-red-900' : 'text-amber-900'
                      }`}
                    >
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.property}</p>
                  </div>
                  {alert.deadline && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(alert.deadline).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/service-charges-management">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Service Charges
                </CardTitle>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardDescription>
                Landlord & Tenant Act 1985 s.20 compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ Cost allocation & tracking</li>
                <li>✓ s.20 consultation workflows</li>
                <li>✓ Reserve fund management</li>
                <li>✓ Annual accounts & leaseholder statements</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/rtm-management">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  RTM Management
                </CardTitle>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardDescription>
                Commonhold & Leasehold Reform Act 2002
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ Leaseholder eligibility verification</li>
                <li>✓ RTM claim & notice management</li>
                <li>✓ Handover checklists</li>
                <li>✓ Company formation tracking</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/building-safety-register">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Building Safety
                </CardTitle>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardDescription>
                Building Safety Act 2023 & Fire Safety Act
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ HRRB & Accountable Person tracking</li>
                <li>✓ Fire risk assessments</li>
                <li>✓ Structural defect register</li>
                <li>✓ Compliance audit schedules</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceCharges.length === 0 && rtmRecords.length === 0 && buildingSafety.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No block management records yet. Start by creating a service charge account or RTM tracking record.
            </p>
          ) : (
            <div className="space-y-4">
              {[
                ...serviceCharges.slice(0, 2).map(sc => ({
                  type: 'Service Charge',
                  title: `Account created for ${properties.find(p => p.id === sc.property_id)?.name}`,
                  date: sc.created_date,
                })),
                ...rtmRecords.slice(0, 2).map(rtm => ({
                  type: 'RTM',
                  title: `RTM status: ${rtm.rtm_status.replace(/_/g, ' ')}`,
                  date: rtm.created_date,
                })),
              ]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}