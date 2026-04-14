import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaskAssignmentForm({ unassignedMaintenance, contractors }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [enableSMS, setEnableSMS] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient();

  const assignTaskMutation = useMutation({
    mutationFn: async () => {
      const contractor = contractors.find(c => c.id === selectedContractor);
      
      const result = await base44.entities.MaintenanceRequest.update(selectedTask.id, {
        assigned_contractor_id: selectedContractor,
        assigned_contractor_name: contractor.name,
        assigned_contractor_email: contractor.email,
        assigned_date: new Date().toISOString(),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: 'assigned',
      });

      // Send SMS notification if enabled
      if (enableSMS && contractor.phone) {
        await base44.functions.invoke('sendContractorSMSNotification', {
          contractorPhone: contractor.phone,
          contractorName: contractor.name,
          taskTitle: selectedTask.title,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          propertyName: selectedTask.property_id,
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-appointments'] });
      setSuccessMessage('Task assigned successfully!');
      setSelectedTask(null);
      setSelectedContractor('');
      setScheduledDate('');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleAssign = async () => {
    if (!selectedTask || !selectedContractor || !scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }
    await assignTaskMutation.mutateAsync();
  };

  if (unassignedMaintenance.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No pending maintenance requests</p>
        <p className="text-sm text-muted-foreground">All maintenance tasks have been assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-100">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="bg-muted rounded-lg p-4 space-y-4">
        {/* Task Selection */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Maintenance Task *</label>
          <select
            value={selectedTask?.id || ''}
            onChange={(e) => {
              const task = unassignedMaintenance.find(t => t.id === e.target.value);
              setSelectedTask(task);
            }}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a task...</option>
            {unassignedMaintenance.map(task => (
              <option key={task.id} value={task.id}>
                {task.title} ({task.priority} priority) - {task.category}
              </option>
            ))}
          </select>
        </div>

        {selectedTask && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
            <p className="text-foreground mb-2"><strong>Description:</strong> {selectedTask.description}</p>
            <p className="text-muted-foreground">Reported: {new Date(selectedTask.created_date).toLocaleDateString()}</p>
          </div>
        )}

        {/* Contractor Selection */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Contractor *</label>
          <select
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a contractor...</option>
            {contractors.map(contractor => (
              <option key={contractor.id} value={contractor.id}>
                {contractor.name} {contractor.phone ? `(${contractor.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Scheduled Date *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* SMS Notification */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enable-sms"
            checked={enableSMS}
            onChange={(e) => setEnableSMS(e.target.checked)}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
          <label htmlFor="enable-sms" className="text-sm font-semibold text-foreground cursor-pointer">
            Send SMS notification to contractor
          </label>
        </div>

        {/* Submit */}
        <Button
          onClick={handleAssign}
          disabled={!selectedTask || !selectedContractor || !scheduledDate || assignTaskMutation.isPending}
          className="w-full gap-2"
        >
          {assignTaskMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Assign Task
            </>
          )}
        </Button>
      </div>
    </div>
  );
}