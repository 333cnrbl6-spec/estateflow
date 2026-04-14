import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2, Clock, AlertCircle, Flame, Zap, Users, FileText } from 'lucide-react';
import { format, parseISO, differenceInDays, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';

function StatusBadge({ status, dueDate }) {
  if (!dueDate) return null;
  
  const days = differenceInDays(parseISO(dueDate), new Date());
  const isOverdue = isBefore(parseISO(dueDate), new Date());

  if (isOverdue) {
    return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs font-semibold">Overdue</span>;
  }
  if (days <= 30) {
    return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100 text-xs font-semibold">Due in {days}d</span>;
  }
  if (days <= 90) {
    return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100 text-xs font-semibold">Upcoming</span>;
  }
  return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 text-xs font-semibold">On track</span>;
}

export default function FireSafetyRegisterView({ propertyId }) {
  const registerQuery = useQuery({
    queryKey: ['fire-safety-register', propertyId],
    queryFn: async () => {
      const registers = await base44.entities.FireSafetyRegister.filter(
        { property_id: propertyId },
        '-created_date',
        1
      );
      return registers[0] || null;
    },
  });

  const { data: register, isLoading } = registerQuery;

  if (isLoading) {
    return <div className="text-center py-8">Loading fire safety register...</div>;
  }

  if (!register) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-2" />
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Fire Safety Register Not Found</h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
          Create a fire safety register for this property to track all fire safety activities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg border-2 p-4 ${
          register.compliance_status === 'compliant' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
          register.compliance_status === 'action_required' ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' :
          'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {register.compliance_status === 'compliant' ? 
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> :
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            }
            <p className="font-semibold text-sm uppercase">Compliance Status</p>
          </div>
          <p className="text-lg font-bold">{register.compliance_status.replace(/_/g, ' ')}</p>
        </div>

        <div className={`rounded-lg border-2 p-4 ${
          register.risk_level === 'low' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
          register.risk_level === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' :
          'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <p className="font-semibold text-sm uppercase">Risk Level</p>
          </div>
          <p className="text-lg font-bold capitalize">{register.risk_level}</p>
        </div>

        <div className="bg-card rounded-lg border-2 border-border p-4">
          <p className="font-semibold text-sm text-muted-foreground mb-2 uppercase">Last Updated</p>
          <p className="text-lg font-bold">{register.last_updated ? format(parseISO(register.last_updated), 'dd MMM yyyy') : 'Never'}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fra" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="fra">Fire Risk Assessment</TabsTrigger>
          <TabsTrigger value="alarms">Alarms & Lighting</TabsTrigger>
          <TabsTrigger value="extinguishers">Extinguishers</TabsTrigger>
          <TabsTrigger value="evacuation">Evacuation Plan</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* FRA Tab */}
        <TabsContent value="fra" className="space-y-4 mt-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Fire Risk Assessment Schedule</h3>
                <p className="text-sm text-muted-foreground mt-1">Annual assessment required for HMOs</p>
              </div>
              <Button size="sm">Upload FRA</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">LAST ASSESSMENT</p>
                <p className="font-semibold text-foreground">
                  {register.fra_schedule?.current_fra_date 
                    ? format(parseISO(register.fra_schedule.current_fra_date), 'dd MMM yyyy')
                    : 'Not recorded'
                  }
                </p>
                {register.fra_schedule?.current_fra_date && (
                  <p className="text-xs text-muted-foreground mt-1">By {register.fra_schedule.fra_history?.[0]?.assessor_name || 'Unknown'}</p>
                )}
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">NEXT ASSESSMENT DUE</p>
                <p className="font-semibold text-foreground">
                  {register.fra_schedule?.next_fra_due
                    ? format(parseISO(register.fra_schedule.next_fra_due), 'dd MMM yyyy')
                    : 'Not scheduled'
                  }
                </p>
                {register.fra_schedule?.next_fra_due && (
                  <div className="mt-2">
                    <StatusBadge status="fra" dueDate={register.fra_schedule.next_fra_due} />
                  </div>
                )}
              </div>
            </div>

            {register.fra_schedule?.fra_history && register.fra_schedule.fra_history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Assessment History</p>
                <div className="space-y-2">
                  {register.fra_schedule.fra_history.map((fra, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{format(parseISO(fra.assessment_date), 'dd MMM yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{fra.assessor_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        fra.overall_risk === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' :
                        fra.overall_risk === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        Risk: {fra.overall_risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Alarms & Lighting Tab */}
        <TabsContent value="alarms" className="space-y-4 mt-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Fire Alarm Testing Schedule
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Weekly testing required</p>
              </div>
              <Button size="sm">Log Test</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">ALARM SYSTEM TYPE</p>
                <p className="font-semibold text-foreground capitalize">{register.fire_alarm_schedule?.alarm_system_type?.replace(/_/g, ' ') || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">NEXT TEST DUE</p>
                <p className="font-semibold text-foreground">
                  {register.fire_alarm_schedule?.next_test_due
                    ? format(parseISO(register.fire_alarm_schedule.next_test_due), 'dd MMM yyyy')
                    : 'Not scheduled'
                  }
                </p>
                {register.fire_alarm_schedule?.next_test_due && (
                  <div className="mt-2">
                    <StatusBadge status="alarm" dueDate={register.fire_alarm_schedule.next_test_due} />
                  </div>
                )}
              </div>
            </div>

            {register.fire_alarm_schedule?.test_records && register.fire_alarm_schedule.test_records.length > 0 && (
              <div className="pt-6 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Recent Test Results</p>
                <div className="space-y-2">
                  {register.fire_alarm_schedule.test_records.slice(0, 5).map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{format(parseISO(record.test_date), 'dd MMM yyyy')}</p>
                        <p className="text-xs text-muted-foreground">Tested by {record.tested_by}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        record.test_result === 'pass' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {record.test_result.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" />
              Emergency Lighting
            </h3>
            {register.emergency_lighting?.installed ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground">Status: <span className="font-semibold text-green-600">Installed</span></p>
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    Last tested: {register.emergency_lighting?.last_tested_date 
                      ? format(parseISO(register.emergency_lighting.last_tested_date), 'dd MMM yyyy')
                      : 'Not recorded'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No emergency lighting system recorded</p>
            )}
          </div>
        </TabsContent>

        {/* Extinguishers Tab */}
        <TabsContent value="extinguishers" className="space-y-4 mt-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Fire Extinguisher Maintenance</h3>
                <p className="text-sm text-muted-foreground mt-1">Annual servicing required</p>
              </div>
              <Button size="sm">Log Service</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">EXTINGUISHERS INSTALLED</p>
                <p className="text-2xl font-bold text-foreground">{register.extinguisher_maintenance?.extinguisher_count || 0}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">NEXT SERVICE DUE</p>
                <p className="font-semibold text-foreground">
                  {register.extinguisher_maintenance?.next_service_due
                    ? format(parseISO(register.extinguisher_maintenance.next_service_due), 'dd MMM yyyy')
                    : 'Not scheduled'
                  }
                </p>
                {register.extinguisher_maintenance?.next_service_due && (
                  <div className="mt-2">
                    <StatusBadge status="ext" dueDate={register.extinguisher_maintenance.next_service_due} />
                  </div>
                )}
              </div>
            </div>

            {register.extinguisher_maintenance?.service_records && register.extinguisher_maintenance.service_records.length > 0 && (
              <div className="pt-6 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Service History</p>
                <div className="space-y-2">
                  {register.extinguisher_maintenance.service_records.slice(0, 3).map((record, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{format(parseISO(record.service_date), 'dd MMM yyyy')}</p>
                          <p className="text-xs text-muted-foreground">{record.contractor_name} • {record.extinguishers_serviced} units</p>
                        </div>
                        {record.certificate_url && (
                          <a href={record.certificate_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Evacuation Plan Tab */}
        <TabsContent value="evacuation" className="space-y-4 mt-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Evacuation Plan & Procedures
                </h3>
              </div>
              <Button size="sm">Upload Plan</Button>
            </div>

            <div className="space-y-4">
              {register.evacuation_plan?.plan_document_url ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100 font-semibold mb-2">✓ Evacuation Plan on File</p>
                  <a href={register.evacuation_plan.plan_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 dark:text-green-300 hover:underline">
                    View Plan Document
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-900 dark:text-red-100 font-semibold">✗ No evacuation plan uploaded</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">ASSEMBLY POINT</p>
                  <p className="font-semibold text-foreground">{register.evacuation_plan?.assembly_point_location || 'Not specified'}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">OCCUPANT BRIEFING</p>
                  <p className="font-semibold text-foreground capitalize">{register.evacuation_plan?.occupant_briefing_schedule || 'Not scheduled'}</p>
                </div>
              </div>

              {register.evacuation_plan?.briefing_history && register.evacuation_plan.briefing_history.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3">Recent Briefings</p>
                  <div className="space-y-2">
                    {register.evacuation_plan.briefing_history.slice(0, 3).map((briefing, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{format(parseISO(briefing.briefing_date), 'dd MMM yyyy')}</p>
                          <p className="text-xs text-muted-foreground">{briefing.occupants_briefed} occupants • {briefing.briefed_by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4 mt-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Remedial Actions & Outstanding Items</h3>

            {register.remedial_actions && register.remedial_actions.length > 0 ? (
              <div className="space-y-3">
                {register.remedial_actions.map((action, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${
                    action.status === 'completed' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
                    action.status === 'overdue' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' :
                    'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{action.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Deadline: {format(parseISO(action.deadline), 'dd MMM yyyy')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                        action.status === 'completed' ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100' :
                        action.status === 'overdue' ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100' :
                        'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100'
                      }`}>
                        {action.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-900 dark:text-green-100 font-semibold">No outstanding actions</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}