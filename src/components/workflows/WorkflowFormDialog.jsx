import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

const TRIGGER_TYPES = [
  { value: 'gas_safety_expiry', label: 'Gas Safety Certificate Expiry', defaultDays: 30 },
  { value: 'epc_expiry', label: 'EPC Expiry', defaultDays: 60 },
  { value: 'electrical_expiry', label: 'Electrical Certificate Expiry', defaultDays: 60 },
  { value: 'rent_overdue', label: 'Rent Overdue', defaultDays: 7 },
  { value: 'deposit_not_registered', label: 'Deposit Not Registered', defaultDays: 7 }
];

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'create_maintenance_order', label: 'Create Maintenance Order' },
  { value: 'create_crm_interaction', label: 'Create CRM Note' },
  { value: 'draft_section8_notice', label: 'Draft Section 8 Notice' }
];

export default function WorkflowFormDialog({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    trigger_type: '',
    days_before: 30,
    is_active: true,
    actions: [{ action_type: 'send_email', email_subject: '', email_body_template: '' }]
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data) => base44.entities.Workflow.create(data),
    onSuccess: () => {
      onSuccess();
    }
  });

  const handleAddAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { action_type: 'send_email' }]
    });
  };

  const handleRemoveAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index)
    });
  };

  const handleActionChange = (index, field, value) => {
    const updatedActions = [...formData.actions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    setFormData({ ...formData, actions: updatedActions });
  };

  const handleTriggerTypeChange = (value) => {
    const trigger = TRIGGER_TYPES.find(t => t.value === value);
    setFormData({
      ...formData,
      trigger_type: value,
      days_before: trigger?.defaultDays || 30
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.trigger_type) {
      alert('Name and trigger type are required');
      return;
    }
    createWorkflowMutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-serif">Create Workflow</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Set up automated actions for property events</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="text-sm font-medium">Workflow Name</label>
            <Input 
              placeholder="e.g. Gas Safety Renewal Reminder"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Trigger Type */}
          <div>
            <label className="text-sm font-medium">Trigger Event</label>
            <Select value={formData.trigger_type} onValueChange={handleTriggerTypeChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Days Before */}
          <div>
            <label className="text-sm font-medium">Days Before Event</label>
            <Input 
              type="number"
              value={formData.days_before}
              onChange={(e) => setFormData({ ...formData, days_before: parseInt(e.target.value) })}
              className="mt-1"
              min="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Workflow will trigger this many days before the event date
            </p>
          </div>

          {/* Actions */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-foreground">Actions to Execute</label>
              <Button size="sm" variant="outline" onClick={handleAddAction} className="gap-1 font-medium">
                <Plus className="w-4 h-4" /> Add Action
              </Button>
            </div>

            <div className="space-y-3">
              {formData.actions.map((action, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3 bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <Select 
                      value={action.action_type} 
                      onValueChange={(val) => handleActionChange(i, 'action_type', val)}
                    >
                      <SelectTrigger className="w-48 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(a => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveAction(i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {action.action_type === 'send_email' && (
                    <div className="space-y-2">
                      <Input 
                        placeholder="Email subject"
                        value={action.email_subject || ''}
                        onChange={(e) => handleActionChange(i, 'email_subject', e.target.value)}
                        size="sm"
                      />
                      <Textarea 
                        placeholder="Email body template (use {{property_name}}, {{tenant_name}} placeholders)"
                        value={action.email_body_template || ''}
                        onChange={(e) => handleActionChange(i, 'email_body_template', e.target.value)}
                        rows="3"
                      />
                    </div>
                  )}

                  {action.action_type === 'create_maintenance_order' && (
                    <div className="space-y-2">
                      <Input 
                        placeholder="Maintenance title"
                        value={action.maintenance_title_template || ''}
                        onChange={(e) => handleActionChange(i, 'maintenance_title_template', e.target.value)}
                      />
                      <Select value={action.maintenance_category || ''} onValueChange={(val) => handleActionChange(i, 'maintenance_category', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="fire_safety">Fire Safety</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {action.action_type === 'create_crm_interaction' && (
                    <div className="space-y-2">
                      <Input 
                        placeholder="CRM subject"
                        value={action.crm_subject_template || ''}
                        onChange={(e) => handleActionChange(i, 'crm_subject_template', e.target.value)}
                      />
                      <Textarea 
                        placeholder="CRM note body"
                        value={action.crm_body_template || ''}
                        onChange={(e) => handleActionChange(i, 'crm_body_template', e.target.value)}
                        rows="2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-6 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1 font-semibold">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 font-semibold"
              disabled={createWorkflowMutation.isPending}
            >
              {createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}