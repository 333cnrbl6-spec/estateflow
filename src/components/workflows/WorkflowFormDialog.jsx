import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ChevronRight, Zap, Layers, CheckCircle2 } from 'lucide-react';

// ─── Catalogue ─────────────────────────────────────────────────────────────

export const TRIGGER_TYPES = [
  // Tenancy
  { value: 'new_tenant_added',         label: 'New Tenant Added',                 category: 'Tenancy',    defaultDays: 0,   desc: 'Fires when a new tenant record is created' },
  { value: 'tenancy_renewal_due',      label: 'Tenancy Renewal Due',              category: 'Tenancy',    defaultDays: 60,  desc: 'N days before tenancy end date' },
  { value: 'rent_overdue',             label: 'Rent Overdue',                     category: 'Tenancy',    defaultDays: 7,   desc: 'N days after rent due date with no payment' },
  { value: 'deposit_not_registered',   label: 'Deposit Not Registered',           category: 'Tenancy',    defaultDays: 7,   desc: 'N days after move-in if deposit unprotected' },
  // Maintenance / OOH
  { value: 'out_of_hours_call',        label: 'Out-of-Hours Call Received',       category: 'Operations', defaultDays: 0,   desc: 'Fires when an OOH call is logged in the system' },
  { value: 'maintenance_order_created',label: 'Maintenance Order Created',        category: 'Operations', defaultDays: 0,   desc: 'Fires when any new maintenance order is raised' },
  { value: 'maintenance_overdue',      label: 'Maintenance Job Overdue',          category: 'Operations', defaultDays: 5,   desc: 'N days after scheduled date if still open' },
  // Finance
  { value: 'service_charge_period',    label: 'Service Charge Period Start',      category: 'Finance',    defaultDays: 30,  desc: 'N days before a new service charge period begins' },
  { value: 'ground_rent_due',          label: 'Ground Rent Due',                  category: 'Finance',    defaultDays: 30,  desc: 'N days before ground rent collection date' },
  { value: 'invoice_overdue',          label: 'Invoice Overdue',                  category: 'Finance',    defaultDays: 14,  desc: 'N days after invoice due date with no payment' },
  // Compliance
  { value: 'gas_safety_expiry',        label: 'Gas Safety Certificate Expiry',    category: 'Compliance', defaultDays: 30,  desc: 'N days before certificate expires' },
  { value: 'epc_expiry',               label: 'EPC Expiry',                       category: 'Compliance', defaultDays: 60,  desc: 'N days before EPC expires' },
  { value: 'electrical_expiry',        label: 'Electrical Certificate (EICR) Expiry', category: 'Compliance', defaultDays: 60, desc: 'N days before EICR expires' },
  { value: 'fire_safety_expiry',       label: 'Fire Risk Assessment Expiry',      category: 'Compliance', defaultDays: 45,  desc: 'N days before fire risk assessment expires' },
  { value: 'asbestos_review_due',      label: 'Asbestos Review Due',              category: 'Compliance', defaultDays: 30,  desc: 'N days before asbestos register review date' },
];

export const ACTION_TYPES = [
  { value: 'send_email',                   label: '📧 Send Email',                       desc: 'Send a templated email to tenant, landlord or manager' },
  { value: 'send_sms',                     label: '📱 Send SMS',                         desc: 'Send an automated SMS notification' },
  { value: 'create_maintenance_order',     label: '🔧 Create Maintenance Order',         desc: 'Raise a maintenance job linked to the property' },
  { value: 'create_referencing_checklist', label: '✅ Start Referencing Checklist',      desc: 'Trigger the full tenant referencing process' },
  { value: 'generate_service_charge_invoice', label: '💷 Generate Service Charge Invoice', desc: 'Auto-generate invoices based on the budget' },
  { value: 'create_crm_interaction',       label: '📋 Log CRM Note',                     desc: 'Add a note to the contact CRM record' },
  { value: 'schedule_callback',            label: '📞 Schedule Callback',                desc: 'Create a callback task for the property manager' },
  { value: 'draft_section8_notice',        label: '⚖️ Draft Section 8 Notice',           desc: 'Prepare a Section 8 notice for review' },
  { value: 'flag_compliance_alert',        label: '🚨 Raise Compliance Alert',           desc: 'Add to compliance dashboard as a priority item' },
];

export const CONDITION_FIELDS = {
  out_of_hours_call:         [{ value: 'severity',    label: 'Severity',     type: 'select', options: ['critical','high','medium','low'] },
                               { value: 'call_type',  label: 'Call Type',    type: 'select', options: ['water_leak','gas_smell','electrical_fault','fire_alarm','heating_failure','access_issue','general_enquiry'] }],
  rent_overdue:              [{ value: 'arrears_days',label: 'Days in Arrears', type: 'number' },
                               { value: 'arrears_amount', label: 'Arrears Amount (£)', type: 'number' }],
  new_tenant_added:          [{ value: 'tenant_type', label: 'Tenant Type',  type: 'select', options: ['leaseholder','assured_shorthold','assured','regulated','licensee'] }],
  maintenance_order_created: [{ value: 'priority',   label: 'Priority',     type: 'select', options: ['emergency','urgent','standard','low'] },
                               { value: 'category',  label: 'Category',     type: 'select', options: ['plumbing','electrical','structural','fire_safety','lift','security','general'] }],
  service_charge_period:     [{ value: 'charge_type',label: 'Charge Type',  type: 'select', options: ['residential','commercial','mixed'] }],
};

// ─── Pre-built templates ────────────────────────────────────────────────────

const TEMPLATES = [
  {
    name: 'New Tenant Referencing',
    description: 'Automatically kick off the referencing checklist and send a welcome email when a new tenant is added.',
    category: 'Tenancy',
    trigger_type: 'new_tenant_added', days_before: 0,
    actions: [
      { action_type: 'create_referencing_checklist' },
      { action_type: 'send_email', email_subject: 'Welcome to {{property_name}} — next steps', email_body_template: 'Dear {{tenant_name}},\n\nThank you for choosing {{property_name}}. We have started your referencing process. Our team will be in touch shortly to confirm the next steps.\n\nKind regards,\n{{company_name}}' },
    ]
  },
  {
    name: 'OOH Emergency → Maintenance Order',
    description: 'When a critical out-of-hours call is received, automatically create a maintenance order.',
    category: 'Operations',
    trigger_type: 'out_of_hours_call', days_before: 0,
    conditions: [{ field: 'severity', operator: 'equals', value: 'critical' }],
    actions: [
      { action_type: 'create_maintenance_order', maintenance_title_template: 'Emergency: {{call_type}} at {{property_address}}', maintenance_category: 'general', maintenance_priority: 'emergency' },
      { action_type: 'send_email', email_subject: 'Emergency call logged — {{property_address}}', email_body_template: 'An emergency out-of-hours call has been received for {{property_address}}.\n\nIssue: {{call_description}}\nCaller: {{caller_name}} ({{caller_phone}})\n\nA maintenance order has been raised automatically. Please review and assign a contractor.' },
    ]
  },
  {
    name: 'Service Charge Invoice Generation',
    description: 'Automatically generate service charge invoices 30 days before each new period starts.',
    category: 'Finance',
    trigger_type: 'service_charge_period', days_before: 30,
    actions: [
      { action_type: 'generate_service_charge_invoice' },
      { action_type: 'send_email', email_subject: 'Service charge statement for {{period}} — {{property_name}}', email_body_template: 'Dear {{leaseholder_name}},\n\nPlease find enclosed your service charge statement for {{property_name}} covering {{period}}.\n\nAmount due: £{{charge_amount}}\nDue date: {{due_date}}\n\nKind regards,\n{{company_name}}' },
    ]
  },
  {
    name: 'Gas Safety Renewal Reminder',
    description: 'Send a reminder email 30 days before gas safety certificate expires and create a maintenance order.',
    category: 'Compliance',
    trigger_type: 'gas_safety_expiry', days_before: 30,
    actions: [
      { action_type: 'create_maintenance_order', maintenance_title_template: 'Gas safety renewal required — {{property_name}}', maintenance_category: 'general', maintenance_priority: 'urgent' },
      { action_type: 'send_email', email_subject: 'Gas safety certificate expiring — {{property_name}}', email_body_template: 'The gas safety certificate for {{property_name}} expires on {{expiry_date}}.\n\nA maintenance order has been raised. Please ensure a Gas Safe registered engineer is booked before expiry to remain compliant.' },
    ]
  },
  {
    name: 'Rent Arrears Escalation',
    description: 'Send a formal arrears notice and log a CRM note when rent is 7+ days overdue.',
    category: 'Tenancy',
    trigger_type: 'rent_overdue', days_before: 7,
    actions: [
      { action_type: 'send_email', email_subject: 'Outstanding rent — immediate action required', email_body_template: 'Dear {{tenant_name}},\n\nWe write to notify you that rent for {{property_address}} is now overdue by {{arrears_days}} days. The outstanding balance is £{{arrears_amount}}.\n\nPlease contact us immediately to arrange payment. If we do not hear from you within 7 days, we may be required to take further action.\n\nKind regards,\n{{company_name}}' },
      { action_type: 'create_crm_interaction', crm_subject_template: 'Rent arrears — {{arrears_days}} days', crm_body_template: 'Automated arrears notice sent. Outstanding: £{{arrears_amount}}.' },
    ]
  },
  {
    name: 'Tenancy Renewal Prompt',
    description: 'Prompt the property manager and contact the tenant 60 days before tenancy expiry.',
    category: 'Tenancy',
    trigger_type: 'tenancy_renewal_due', days_before: 60,
    actions: [
      { action_type: 'send_email', email_subject: 'Your tenancy is due for renewal — {{property_address}}', email_body_template: 'Dear {{tenant_name}},\n\nYour tenancy at {{property_address}} is due to expire on {{tenancy_end_date}}. We would love to discuss renewal options with you.\n\nPlease contact us at your earliest convenience to discuss next steps.' },
      { action_type: 'schedule_callback', callback_notes: 'Tenancy renewal — 60 day contact. Tenant: {{tenant_name}}, expires {{tenancy_end_date}}' },
    ]
  },
];

const CATEGORY_COLORS = { Tenancy: '#3b82f6', Operations: '#f59e0b', Finance: '#16a34a', Compliance: '#dc2626' };

// ─── Component ──────────────────────────────────────────────────────────────

export default function WorkflowFormDialog({ onClose, onSuccess, initialData = null }) {
  const [mode, setMode] = useState(initialData ? 'form' : 'choose'); // 'choose' | 'form'
  const [formData, setFormData] = useState(initialData || {
    name: '', trigger_type: '', days_before: 30, is_active: true, conditions: [], actions: []
  });

  const mutation = useMutation({
    mutationFn: (data) => initialData
      ? base44.entities.Workflow.update(initialData.id, data)
      : base44.entities.Workflow.create(data),
    onSuccess: () => onSuccess()
  });

  const applyTemplate = (tpl) => {
    setFormData({ ...tpl, is_active: true, conditions: tpl.conditions || [] });
    setMode('form');
  };

  const handleTriggerChange = (value) => {
    const t = TRIGGER_TYPES.find(x => x.value === value);
    setFormData(f => ({ ...f, trigger_type: value, days_before: t?.defaultDays ?? 30, conditions: [] }));
  };

  const addAction = () => setFormData(f => ({ ...f, actions: [...f.actions, { action_type: 'send_email' }] }));
  const removeAction = (i) => setFormData(f => ({ ...f, actions: f.actions.filter((_, idx) => idx !== i) }));
  const updateAction = (i, field, val) => setFormData(f => {
    const actions = [...f.actions];
    actions[i] = { ...actions[i], [field]: val };
    return { ...f, actions };
  });

  const addCondition = () => setFormData(f => ({ ...f, conditions: [...(f.conditions || []), { field: '', operator: 'equals', value: '' }] }));
  const removeCondition = (i) => setFormData(f => ({ ...f, conditions: f.conditions.filter((_, idx) => idx !== i) }));
  const updateCondition = (i, field, val) => setFormData(f => {
    const conditions = [...(f.conditions || [])];
    conditions[i] = { ...conditions[i], [field]: val };
    return { ...f, conditions };
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.trigger_type || !formData.actions?.length) {
      alert('Name, trigger, and at least one action are required.');
      return;
    }
    mutation.mutate(formData);
  };

  const availableConditions = CONDITION_FIELDS[formData.trigger_type] || [];
  const triggerDef = TRIGGER_TYPES.find(t => t.value === formData.trigger_type);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {initialData ? 'Edit Workflow' : 'Create Workflow'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Automate property management tasks with triggers, conditions and actions</p>
        </DialogHeader>

        {/* ── CHOOSE MODE: templates ── */}
        {mode === 'choose' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Start from a template</p>
              <Button variant="outline" size="sm" onClick={() => setMode('form')}>
                <Plus className="w-3 h-3 mr-1" /> Build from scratch
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {TEMPLATES.map((tpl, i) => (
                <button key={i} onClick={() => applyTemplate(tpl)}
                  className="text-left border rounded-xl p-4 hover:border-primary hover:bg-accent/30 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{tpl.name}</span>
                        <Badge variant="outline" style={{ color: CATEGORY_COLORS[tpl.category], borderColor: CATEGORY_COLORS[tpl.category], fontSize: 10 }}>
                          {tpl.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{tpl.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {tpl.actions.map((a, j) => {
                          const def = ACTION_TYPES.find(x => x.value === a.action_type);
                          return <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded">{def?.label || a.action_type}</span>;
                        })}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-1 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FORM MODE ── */}
        {mode === 'form' && (
          <div className="space-y-5 pt-2">
            {!initialData && (
              <button onClick={() => setMode('choose')} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                ← Back to templates
              </button>
            )}

            {/* Name */}
            <div>
              <label className="text-sm font-medium">Workflow Name *</label>
              <Input placeholder="e.g. Emergency OOH → Maintenance Order" value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>

            {/* Trigger */}
            <div className="border rounded-xl p-4 bg-blue-50/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-semibold">Trigger — When should this run?</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Trigger Event *</label>
                  <Select value={formData.trigger_type} onValueChange={handleTriggerChange}>
                    <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select trigger…" /></SelectTrigger>
                    <SelectContent>
                      {['Tenancy','Operations','Finance','Compliance'].map(cat => (
                        <React.Fragment key={cat}>
                          <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">{cat}</div>
                          {TRIGGER_TYPES.filter(t => t.category === cat).map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {triggerDef && triggerDef.defaultDays > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Days Before/After Event</label>
                    <Input type="number" min="0" value={formData.days_before}
                      onChange={e => setFormData(f => ({ ...f, days_before: parseInt(e.target.value) || 0 }))}
                      className="mt-1 bg-white" />
                  </div>
                )}
              </div>

              {triggerDef && (
                <p className="text-xs text-muted-foreground">ℹ {triggerDef.desc}</p>
              )}
            </div>

            {/* Conditions */}
            <div className="border rounded-xl p-4 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold">Conditions — Only run if… <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
                </div>
                {availableConditions.length > 0 && (
                  <Button size="sm" variant="outline" onClick={addCondition} className="h-7 text-xs gap-1 bg-white">
                    <Plus className="w-3 h-3" /> Add Condition
                  </Button>
                )}
              </div>

              {availableConditions.length === 0 && (
                <p className="text-xs text-muted-foreground">Select a trigger first to see available conditions.</p>
              )}

              {(formData.conditions || []).map((cond, i) => {
                const fieldDef = availableConditions.find(f => f.value === cond.field);
                return (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <Select value={cond.field} onValueChange={v => updateCondition(i, 'field', v)}>
                      <SelectTrigger className="w-40 h-8 text-xs bg-white"><SelectValue placeholder="Field" /></SelectTrigger>
                      <SelectContent>
                        {availableConditions.map(fc => <SelectItem key={fc.value} value={fc.value}>{fc.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={cond.operator || 'equals'} onValueChange={v => updateCondition(i, 'operator', v)}>
                      <SelectTrigger className="w-28 h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="greater_than">greater than</SelectItem>
                        <SelectItem value="less_than">less than</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldDef?.type === 'select' ? (
                      <Select value={cond.value || ''} onValueChange={v => updateCondition(i, 'value', v)}>
                        <SelectTrigger className="w-36 h-8 text-xs bg-white"><SelectValue placeholder="Value" /></SelectTrigger>
                        <SelectContent>
                          {fieldDef.options.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g, ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input className="w-28 h-8 text-xs bg-white" placeholder="Value" value={cond.value || ''}
                        onChange={e => updateCondition(i, 'value', e.target.value)} />
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeCondition(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="border rounded-xl p-4 bg-green-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <span className="text-sm font-semibold">Actions — Then do this…</span>
                </div>
                <Button size="sm" variant="outline" onClick={addAction} className="h-7 text-xs gap-1 bg-white">
                  <Plus className="w-3 h-3" /> Add Action
                </Button>
              </div>

              {formData.actions?.length === 0 && (
                <p className="text-xs text-muted-foreground">Add at least one action to complete the workflow.</p>
              )}

              {(formData.actions || []).map((action, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <Select value={action.action_type} onValueChange={v => updateAction(i, 'action_type', v)}>
                      <SelectTrigger className="w-56 font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => removeAction(i)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Action-specific fields */}
                  {action.action_type === 'send_email' && (
                    <div className="space-y-2">
                      <Input placeholder="Subject — use {{tenant_name}}, {{property_name}}, {{property_address}}, {{expiry_date}}" value={action.email_subject || ''}
                        onChange={e => updateAction(i, 'email_subject', e.target.value)} />
                      <Textarea placeholder="Email body — use placeholders like {{tenant_name}}, {{property_address}}, {{arrears_amount}}, {{due_date}}" rows={3}
                        value={action.email_body_template || ''} onChange={e => updateAction(i, 'email_body_template', e.target.value)} />
                    </div>
                  )}

                  {action.action_type === 'send_sms' && (
                    <Textarea placeholder="SMS message — e.g. Reminder: rent is overdue for {{property_address}}. Please contact us on 0161 xxx xxxx." rows={2}
                      value={action.sms_template || ''} onChange={e => updateAction(i, 'sms_template', e.target.value)} />
                  )}

                  {action.action_type === 'create_maintenance_order' && (
                    <div className="space-y-2">
                      <Input placeholder="Title — e.g. Gas safety renewal required — {{property_name}}" value={action.maintenance_title_template || ''}
                        onChange={e => updateAction(i, 'maintenance_title_template', e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={action.maintenance_category || ''} onValueChange={v => updateAction(i, 'maintenance_category', v)}>
                          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            {['plumbing','electrical','structural','fire_safety','lift','security','general','other'].map(c =>
                              <SelectItem key={c} value={c}>{c.replace(/_/g,' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={action.maintenance_priority || 'standard'} onValueChange={v => updateAction(i, 'maintenance_priority', v)}>
                          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                          <SelectContent>
                            {['emergency','urgent','standard','low'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {action.action_type === 'create_referencing_checklist' && (
                    <div className="text-xs text-muted-foreground bg-blue-50 rounded p-2">
                      ℹ Automatically creates a referencing checklist task linked to the new tenant. No additional configuration required — the tenant data is populated automatically.
                    </div>
                  )}

                  {action.action_type === 'generate_service_charge_invoice' && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground bg-green-50 rounded p-2">
                        ℹ Invoices are generated automatically based on the service charge budget for the period. Review in the Billing module before sending.
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium w-36">Auto-send to leaseholders</label>
                        <Select value={action.auto_send || 'no'} onValueChange={v => updateAction(i, 'auto_send', v)}>
                          <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No — draft only</SelectItem>
                            <SelectItem value="yes">Yes — send immediately</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {action.action_type === 'create_crm_interaction' && (
                    <div className="space-y-2">
                      <Input placeholder="Subject — e.g. Rent arrears notice sent" value={action.crm_subject_template || ''}
                        onChange={e => updateAction(i, 'crm_subject_template', e.target.value)} />
                      <Textarea placeholder="Note body" rows={2} value={action.crm_body_template || ''}
                        onChange={e => updateAction(i, 'crm_body_template', e.target.value)} />
                    </div>
                  )}

                  {action.action_type === 'schedule_callback' && (
                    <div className="space-y-2">
                      <Input placeholder="Callback reason — e.g. Tenancy renewal discussion with {{tenant_name}}" value={action.callback_notes || ''}
                        onChange={e => updateAction(i, 'callback_notes', e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Days from trigger</label>
                          <Input type="number" min="0" value={action.callback_days || 1} className="mt-1"
                            onChange={e => updateAction(i, 'callback_days', parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Priority</label>
                          <Select value={action.callback_priority || 'normal'} onValueChange={v => updateAction(i, 'callback_priority', v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {action.action_type === 'flag_compliance_alert' && (
                    <Input placeholder="Alert message — e.g. Gas safety certificate expires in {{days_until_expiry}} days" value={action.alert_message || ''}
                      onChange={e => updateAction(i, 'alert_message', e.target.value)} />
                  )}
                </div>
              ))}
            </div>

            {/* Placeholders reference */}
            <div className="bg-muted/30 rounded-lg p-3 border">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Available placeholders in templates:</p>
              <div className="flex flex-wrap gap-1.5">
                {['{{tenant_name}}','{{property_name}}','{{property_address}}','{{landlord_name}}','{{company_name}}','{{expiry_date}}','{{due_date}}','{{arrears_amount}}','{{arrears_days}}','{{charge_amount}}','{{period}}','{{call_type}}','{{call_description}}','{{tenancy_end_date}}','{{days_until_expiry}}'].map(p => (
                  <code key={p} className="text-xs bg-white border rounded px-1.5 py-0.5 text-primary font-mono">{p}</code>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" />{initialData ? 'Save Changes' : 'Create Workflow'}</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}