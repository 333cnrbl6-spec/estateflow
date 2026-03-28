import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import ComplianceChecklist from './ComplianceChecklist';
import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'applicant', label: 'Applicant' },
  { id: 'referencing', label: 'Referencing' },
  { id: 'offer_agreed', label: 'Offer Agreed' },
  { id: 'pre_tenancy_certs', label: 'Pre-Tenancy Certs' },
  { id: 'tenancy_signed', label: 'Tenancy Signed' },
  { id: 'handover', label: 'Handover' },
  { id: 'occupied', label: 'Occupied' },
  { id: 'periodic_check', label: 'Periodic Check' },
  { id: 'notice_served', label: 'Notice Served' },
  { id: 'vacating', label: 'Vacating' },
  { id: 'void', label: 'Void' },
  { id: 'archived', label: 'Archived' },
];

function Section({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-semibold text-foreground">
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BoolField({ label, hint, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
  );
}

function DateField({ label, hint, value, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} />
    </Field>
  );
}

function SelectField({ label, hint, value, onChange, options }) {
  return (
    <Field label={label} hint={hint}>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export default function PipelineDetailDrawer({ record, onClose, onSave, onDelete, saving }) {
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('details');

  useEffect(() => {
    setForm(record || { stage: 'applicant', jurisdiction: 'england' });
  }, [record]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const isWales = form.jurisdiction === 'wales';
  const isEngland = form.jurisdiction === 'england';

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              {record ? (record.unit_reference ? `${record.unit_reference}, ` : '') + record.property_address : 'New Application'}
            </h2>
            {form.reference && <p className="text-sm text-muted-foreground font-mono">{form.reference}</p>}
          </div>
          <div className="flex items-center gap-2">
            {record && (
              <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {['details', 'compliance', 'timeline'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors', tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {tab === 'details' && (
              <>
                <Section title="Stage & Jurisdiction" defaultOpen>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Pipeline Stage" value={form.stage} onChange={v => set('stage', v)}
                      options={STAGES.map(s => ({ value: s.id, label: s.label }))} />
                    <SelectField label="Jurisdiction" hint="Determines legislation"
                      value={form.jurisdiction} onChange={v => set('jurisdiction', v)}
                      options={[{ value: 'england', label: 'England' }, { value: 'wales', label: 'Wales' }]} />
                  </div>
                  <Field label="Internal Reference">
                    <Input value={form.reference || ''} onChange={e => set('reference', e.target.value)} placeholder="e.g. TP-2026-001" />
                  </Field>
                  {isWales && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Wales:</strong> Renting Homes (Wales) Act 2016 applies. Written statement must be issued within 14 days of occupation. Rent Smart Wales registration/licence required. Fitness for Human Habitation (FFHH) standard applies.</span>
                    </div>
                  )}
                  {isEngland && (
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>England:</strong> Housing Act 1988 (AST), Right to Rent checks required, How to Rent guide mandatory, Deposit protection within 30 days, MEES EPC min E.</span>
                    </div>
                  )}
                </Section>

                <Section title="Property" defaultOpen>
                  <Field label="Property Address">
                    <Input value={form.property_address || ''} onChange={e => set('property_address', e.target.value)} placeholder="Full address" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Unit / Flat Reference">
                      <Input value={form.unit_reference || ''} onChange={e => set('unit_reference', e.target.value)} placeholder="e.g. Flat 4" />
                    </Field>
                    <Field label="Monthly Rent (£)">
                      <Input type="number" value={form.monthly_rent || ''} onChange={e => set('monthly_rent', Number(e.target.value))} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <BoolField label="HMO Licensed" hint="≥5 occupants / ≥2 households" value={form.hmo_licensed} onChange={v => set('hmo_licensed', v)} />
                    <BoolField label="Selective Licensing Area" hint="Check local council" value={form.selective_licensing_area} onChange={v => set('selective_licensing_area', v)} />
                  </div>
                  {form.hmo_licensed && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="HMO Licence Number"><Input value={form.hmo_licence_number || ''} onChange={e => set('hmo_licence_number', e.target.value)} /></Field>
                      <DateField label="HMO Licence Expiry" value={form.hmo_licence_expiry} onChange={v => set('hmo_licence_expiry', v)} />
                    </div>
                  )}
                  {form.selective_licensing_area && (
                    <Field label="Selective Licence Number"><Input value={form.selective_licence_number || ''} onChange={e => set('selective_licence_number', e.target.value)} /></Field>
                  )}
                </Section>

                <Section title="Applicant / Tenant">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name"><Input value={form.applicant_name || ''} onChange={e => set('applicant_name', e.target.value)} /></Field>
                    <Field label="Phone"><Input value={form.applicant_phone || ''} onChange={e => set('applicant_phone', e.target.value)} /></Field>
                  </div>
                  <Field label="Email"><Input type="email" value={form.applicant_email || ''} onChange={e => set('applicant_email', e.target.value)} /></Field>
                </Section>

                <Section title="Tenancy Dates">
                  <div className="grid grid-cols-2 gap-4">
                    <DateField label="Tenancy Start" value={form.tenancy_start_date} onChange={v => set('tenancy_start_date', v)} />
                    <DateField label="Tenancy End" value={form.tenancy_end_date} onChange={v => set('tenancy_end_date', v)} />
                    <DateField label="Handover Date" value={form.handover_date} onChange={v => set('handover_date', v)} />
                    <DateField label="Check-In Date" value={form.check_in_date} onChange={v => set('check_in_date', v)} />
                  </div>
                </Section>

                <Section title="Deposit">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Deposit Amount (£)">
                      <Input type="number" value={form.deposit_amount || ''} onChange={e => set('deposit_amount', Number(e.target.value))} />
                    </Field>
                    <SelectField label="Deposit Scheme" value={form.deposit_scheme} onChange={v => set('deposit_scheme', v)}
                      options={[{ value: 'dps', label: 'DPS' }, { value: 'mydeposits', label: 'MyDeposits' }, { value: 'tds', label: 'TDS' }, { value: 'none', label: 'None' }]} />
                  </div>
                  <DateField label="Deposit Registered Date" hint="Must be within 30 days of tenancy start (England & Wales)" value={form.deposit_registered_date} onChange={v => set('deposit_registered_date', v)} />
                </Section>

                <Section title="Notice & Vacation">
                  <SelectField label="Notice Type"
                    value={form.notice_type} onChange={v => set('notice_type', v)}
                    hint={isWales ? 'Wales: Occupation Contract Notice under Renting Homes Act' : 'England: S21 (no-fault) or S8 (fault) — note Renters Rights Bill'}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'section_21', label: 'Section 21 (England - No Fault)' },
                      { value: 'section_8', label: 'Section 8 (England - Fault)' },
                      { value: 'occupation_contract_notice_wales', label: 'Occupation Contract Notice (Wales)' },
                      { value: 'mutual_surrender', label: 'Mutual Surrender' },
                    ]} />
                  <div className="grid grid-cols-2 gap-4">
                    <DateField label="Notice Served Date" value={form.notice_served_date} onChange={v => set('notice_served_date', v)} />
                    <DateField label="Notice Expiry Date" value={form.notice_expiry_date} onChange={v => set('notice_expiry_date', v)} />
                    <DateField label="Check-Out Date" value={form.check_out_date} onChange={v => set('check_out_date', v)} />
                    <DateField label="Vacate Date" value={form.vacate_date} onChange={v => set('vacate_date', v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <BoolField label="Check-Out Completed" value={form.check_out_completed} onChange={v => set('check_out_completed', v)} />
                    <BoolField label="Deposit Dispute" value={form.deposit_dispute} onChange={v => set('deposit_dispute', v)} />
                  </div>
                  <DateField label="Deposit Returned Date" hint="Within 10 days of agreement" value={form.deposit_returned_date} onChange={v => set('deposit_returned_date', v)} />
                </Section>

                <Section title="Notes">
                  <Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={4} placeholder="Internal notes, issues, communications..." />
                </Section>
              </>
            )}

            {tab === 'compliance' && (
              <ComplianceChecklist form={form} set={set} isWales={isWales} isEngland={isEngland} />
            )}

            {tab === 'timeline' && (
              <PipelineTimeline record={form} />
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving...' : record ? 'Save Changes' : 'Create Record'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PipelineTimeline({ record }) {
  const TIMELINE_STEPS = [
    { stage: 'applicant', label: 'Application Received', tasks: ['Enquiry logged', 'Viewing arranged', 'Application form completed'] },
    { stage: 'referencing', label: 'Referencing', tasks: ['Credit check', 'Employment reference', 'Previous landlord reference', 'Right to Rent check (England)', 'Identity verified'] },
    { stage: 'offer_agreed', label: 'Offer Agreed', tasks: ['Rent agreed', 'Deposit amount confirmed', 'Tenancy start date set', 'Terms agreed in writing'] },
    { stage: 'pre_tenancy_certs', label: 'Pre-Tenancy Certifications', tasks: ['EPC provided (min E)', 'Gas Safety Certificate issued', 'EICR provided', 'How to Rent guide (England)', 'Smoke & CO alarms fitted', 'Legionella risk assessment'] },
    { stage: 'tenancy_signed', label: 'Tenancy Agreement Signed', tasks: ['AST signed by all parties (England)', 'Occupation Contract signed (Wales)', 'Written statement issued within 14 days (Wales)', 'Deposit registered within 30 days', 'Prescribed information served (England)'] },
    { stage: 'handover', label: 'Handover', tasks: ['Inventory compiled & signed', 'Check-in completed', 'Meter readings recorded', 'Keys issued', 'Utility accounts transferred'] },
    { stage: 'occupied', label: 'Occupied — Periodic Management', tasks: ['3-month inspection', '6-month inspection', 'Annual gas safety renewal', '5-yearly EICR renewal', 'Rent review (if applicable)', 'Deposit scheme renewal notice'] },
    { stage: 'notice_served', label: 'Notice Served', tasks: ['Correct notice form used', 'Minimum notice period observed', 'Section 21 validity checklist (England)', 'Any rent arrears documented'] },
    { stage: 'vacating', label: 'Vacating', tasks: ['Final inspection / check-out', 'Inventory comparison', 'Meter readings', 'Keys returned', 'Deposit deductions agreed', 'Deposit returned within 10 days'] },
    { stage: 'void', label: 'Void Period', tasks: ['Property cleaned / refurbished', 'Any works completed', 'Certs renewed if expired', 'Re-listed for letting'] },
  ];

  const currentIndex = TIMELINE_STEPS.findIndex(s => s.stage === record.stage);

  return (
    <div className="space-y-3">
      {TIMELINE_STEPS.map((step, i) => {
        const isPast = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.stage} className={cn('border rounded-lg p-3', isCurrent ? 'border-primary bg-primary/5' : isPast ? 'border-emerald-200 bg-emerald-50/40' : 'border-border bg-muted/20')}>
            <div className="flex items-center gap-2 mb-2">
              {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : isCurrent ? <ChevronRight className="w-4 h-4 text-primary" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
              <span className={cn('text-sm font-semibold', isCurrent ? 'text-primary' : isPast ? 'text-emerald-700' : 'text-muted-foreground')}>{step.label}</span>
              {isCurrent && <span className="text-[11px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">Current</span>}
            </div>
            <ul className="ml-6 space-y-0.5">
              {step.tasks.map((t, j) => (
                <li key={j} className={cn('text-xs flex items-center gap-1.5', isPast ? 'text-emerald-700' : 'text-muted-foreground')}>
                  {isPast ? <CheckCircle2 className="w-2.5 h-2.5 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />}
                  {t}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}