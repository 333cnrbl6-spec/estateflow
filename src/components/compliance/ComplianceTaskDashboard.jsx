import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle2, AlertCircle, Mail, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ComplianceTaskDashboard() {
  const [sending, setSending] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading, refetch } = useQuery({
    queryKey: ['complianceTasks'],
    queryFn: async () => {
      const tasks = await base44.entities.ComplianceTask.filter({
        status: { $in: ['pending', 'reminder_sent', 'reminder_needed', 'escalated'] }
      }, '-days_until_expiry', 100);
      return tasks;
    }
  });

  const { data: properties = {} } = useQuery({
    queryKey: ['propertiesMap'],
    queryFn: async () => {
      const props = await base44.entities.Property.list();
      return Object.fromEntries(props.map(p => [p.id, p]));
    }
  });

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.property_id]) acc[task.property_id] = [];
    acc[task.property_id].push(task);
    return acc;
  }, {});

  const overdueTasks = tasks.filter(t => t.priority === 'overdue');
  const warningTasks = tasks.filter(t => t.priority === 'warning');
  const upcomingTasks = tasks.filter(t => t.priority === 'upcoming');

  const handleSendReminders = async () => {
    setSending(true);
    try {
      const taskIds = warningTasks.map(t => t.id);
      await base44.functions.invoke('sendComplianceNotifications', { task_ids: taskIds });
      refetch();
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async (taskId) => {
    await base44.entities.ComplianceTask.update(taskId, { status: 'escalated' });
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-red-600">{overdueTasks.length}</div>
          <p className="text-sm text-red-700 mt-1">Overdue Renewals</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-amber-600">{warningTasks.length}</div>
          <p className="text-sm text-amber-700 mt-1">Due Soon (14 days)</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600">{upcomingTasks.length}</div>
          <p className="text-sm text-blue-700 mt-1">Upcoming (30 days)</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-slate-600">{tasks.length}</div>
          <p className="text-sm text-slate-700 mt-1">Total Active Tasks</p>
        </div>
      </div>

      {/* Action Buttons */}
      {warningTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-900">{warningTasks.length} reminders ready to send</p>
            <p className="text-sm text-amber-800 mt-1">Send notifications to landlords and contractors</p>
          </div>
          <Button onClick={handleSendReminders} disabled={sending} className="gap-2">
            {sending ? '...' : <>Send Reminders</>}
          </Button>
        </div>
      )}

      {/* Overdue Alerts */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-900">Immediate Action Required</p>
          </div>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <div key={task.id} className="bg-white rounded p-3 border border-red-200 flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{task.certificate_type.toUpperCase()}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {properties[task.property_id]?.name || task.property_id} • {Math.abs(task.days_until_expiry)} days overdue
                  </p>
                </div>
                <Button size="sm" onClick={() => handleEscalate(task.id)} className="gap-1">
                  <Zap className="w-3 h-3" /> Escalate
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks by Property */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Tasks by Property</h3>
        {Object.entries(groupedTasks).map(([propId, propTasks]) => (
          <div key={propId} className="border rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-4 border-b">
              <p className="font-medium text-slate-900">{properties[propId]?.name || propId}</p>
              <p className="text-xs text-slate-600 mt-1">{propTasks.length} active task(s)</p>
            </div>
            <div className="divide-y">
              {propTasks.map(task => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">
                          {task.certificate_type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <Badge variant={
                          task.priority === 'overdue' ? 'destructive' :
                          task.priority === 'warning' ? 'secondary' :
                          'outline'
                        }>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p><strong>Expires:</strong> {new Date(task.expiry_date).toLocaleDateString()}</p>
                        <p>
                          {task.days_until_expiry <= 0 ? (
                            <span className="text-red-600"><strong>{Math.abs(task.days_until_expiry)} days overdue</strong></span>
                          ) : (
                            <span className="text-blue-600"><strong>{task.days_until_expiry} days remaining</strong></span>
                          )}
                        </p>
                        <p><strong>Est. Cost:</strong> £{task.estimated_cost}</p>
                        {task.assigned_contractor_name && (
                          <p><strong>Contractor:</strong> {task.assigned_contractor_name}</p>
                        )}
                        {task.last_reminder_sent && (
                          <p><strong>Last Reminder:</strong> {new Date(task.last_reminder_sent).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Mail className="w-3 h-3" /> Remind
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="w-3 h-3 mr-1" /> In Progress
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <Button size="sm" variant="outline" disabled className="text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}