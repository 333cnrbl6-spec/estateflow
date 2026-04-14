import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Settings, Zap, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WORKFLOW_TRIGGERS = [
  { id: 'cert_expiry_90', label: 'Certificate expiring in 90 days', threshold: 90 },
  { id: 'cert_expiry_60', label: 'Certificate expiring in 60 days', threshold: 60 },
  { id: 'cert_expiry_30', label: 'Certificate expiring in 30 days', threshold: 30 },
  { id: 'license_expiry_90', label: 'License expiring in 90 days', threshold: 90 },
  { id: 'license_expiry_60', label: 'License expiring in 60 days', threshold: 60 },
  { id: 'license_expiry_30', label: 'License expiring in 30 days', threshold: 30 },
  { id: 'high_risk_score', label: 'High compliance risk score (>70)', threshold: null },
];

const WORKFLOW_ACTIONS = [
  { id: 'create_task', label: 'Create task for property manager' },
  { id: 'send_notification', label: 'Send email notification' },
  { id: 'escalate_urgent', label: 'Mark as urgent if <30 days' },
];

export default function ComplianceWorkflowConfig() {
  const queryClient = useQueryClient();
  const [selectedTriggers, setSelectedTriggers] = useState(new Set());
  const [selectedActions, setSelectedActions] = useState(new Set());
  const [riskScoreThreshold, setRiskScoreThreshold] = useState('70');
  const [assignTo, setAssignTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Fetch existing workflow config
  const { data: workflowConfig, isLoading } = useQuery({
    queryKey: ['compliance-workflow-config'],
    queryFn: async () => {
      try {
        const configs = await base44.entities.ComplianceAlertConfig.list('-updated_date', 1);
        return configs[0] || null;
      } catch {
        return null;
      }
    }
  });

  React.useEffect(() => {
    if (workflowConfig) {
      setSelectedTriggers(new Set(workflowConfig.triggers || []));
      setSelectedActions(new Set(workflowConfig.actions || []));
      setRiskScoreThreshold(String(workflowConfig.risk_score_threshold || 70));
      setAssignTo(workflowConfig.assigned_to_role || '');
    }
  }, [workflowConfig]);

  const toggleTrigger = (triggerId) => {
    const newSet = new Set(selectedTriggers);
    if (newSet.has(triggerId)) {
      newSet.delete(triggerId);
    } else {
      newSet.add(triggerId);
    }
    setSelectedTriggers(newSet);
  };

  const toggleAction = (actionId) => {
    const newSet = new Set(selectedActions);
    if (newSet.has(actionId)) {
      newSet.delete(actionId);
    } else {
      newSet.add(actionId);
    }
    setSelectedActions(newSet);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const configData = {
        triggers: Array.from(selectedTriggers),
        actions: Array.from(selectedActions),
        risk_score_threshold: parseInt(riskScoreThreshold),
        assigned_to_role: assignTo,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (workflowConfig?.id) {
        await base44.entities.ComplianceAlertConfig.update(workflowConfig.id, configData);
      } else {
        await base44.entities.ComplianceAlertConfig.create(configData);
      }

      queryClient.invalidateQueries({ queryKey: ['compliance-workflow-config'] });
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunAutomation = async () => {
    setSaving(true);
    try {
      const result = await base44.functions.invoke('complianceTaskAutomation', {});
      setLastSync(new Date());
      queryClient.invalidateQueries({ queryKey: ['compliance-tasks'] });
    } catch (err) {
      console.error('Failed to run automation:', err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Compliance Workflow Automation
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure automatic triggers and actions for compliance task management
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Manual Automation Run</p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-0.5">
                Trigger the compliance automation now to check for expiring certificates and create tasks.
              </p>
              {lastSync && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Last run: {lastSync.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleRunAutomation}
            disabled={saving}
            variant="default"
            size="sm"
            className="shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Run Now
          </Button>
        </div>
      </div>

      {/* Triggers Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Workflow Triggers</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Select which events should automatically create compliance tasks
        </p>
        <div className="space-y-3">
          {WORKFLOW_TRIGGERS.map(trigger => (
            <label key={trigger.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTriggers.has(trigger.id)}
                onChange={() => toggleTrigger(trigger.id)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{trigger.label}</p>
                {trigger.threshold && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Triggers when {trigger.threshold} days or less remain
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Workflow Actions</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Select what actions should be taken when a trigger is activated
        </p>
        <div className="space-y-3 mb-6">
          {WORKFLOW_ACTIONS.map(action => (
            <label key={action.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedActions.has(action.id)}
                onChange={() => toggleAction(action.id)}
                className="w-4 h-4"
              />
              <p className="font-medium text-foreground">{action.label}</p>
            </label>
          ))}
        </div>

        {/* Risk Score Threshold */}
        <div className="pt-6 border-t border-border">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Risk Score Threshold for High-Priority Tasks
          </label>
          <div className="flex items-end gap-3">
            <Input
              type="number"
              min="0"
              max="100"
              value={riskScoreThreshold}
              onChange={(e) => setRiskScoreThreshold(e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground mb-1">/ 100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tasks will be marked as urgent when risk score exceeds this threshold
          </p>
        </div>
      </div>

      {/* Assignment Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Task Assignment</h4>
        <label className="block text-sm font-medium text-foreground mb-3">
          Assign tasks to (optional)
        </label>
        <Select value={assignTo} onValueChange={setAssignTo}>
          <SelectTrigger>
            <SelectValue placeholder="Select role or leave empty for manual assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Manual Assignment (Default)</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="property_manager">Property Manager</SelectItem>
            <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Leave empty to keep tasks unassigned for manual review
        </p>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSaveConfig}
        disabled={saving || (selectedTriggers.size === 0 && selectedActions.size === 0)}
        size="lg"
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving Configuration...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Save Workflow Configuration
          </>
        )}
      </Button>

      {/* Info Box */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">Automation Schedule</p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Automations run daily at 2:00 AM UTC. You can also trigger manually above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}