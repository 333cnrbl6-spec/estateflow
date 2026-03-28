import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TODAY = new Date();

function CertBlock({ title, legislation, color = 'blue', children }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
    violet: 'bg-violet-50 border-violet-200',
  };
  return (
    <div className={cn('border rounded-lg p-4 space-y-3', colors[color])}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {legislation && <span className="text-[10px] text-muted-foreground bg-white/60 border rounded px-1.5 py-0.5 font-mono shrink-0">{legislation}</span>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BoolRow({ label, hint, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex-1">
        <p className="text-sm text-foreground">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
  );
}

function ExpiryAlert({ dateStr }) {
  if (!dateStr) return null;
  const days = differenceInDays(parseISO(dateStr), TODAY);
  if (days < 0) return <p className="text-[11px] text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> EXPIRED {Math.abs(days)} days ago</p>;
  if (days <= 30) return <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Expires in {days} days</p>;
  return <p className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Valid ({days} days remaining)</p>;
}

export default function ComplianceChecklist({ form, set, isWales, isEngland }) {
  return (
    <div className="space-y-4">

      {/* EPC */}
      <CertBlock title="Energy Performance Certificate (EPC)" legislation="SI 2007/991 / MEES 2018" color="green">
        <div className="grid grid-cols-2 gap-3">
          <Field label="EPC Rating">
            <Select value={form.epc_rating || ''} onValueChange={v => set('epc_rating', v)}>
              <SelectTrigger><SelectValue placeholder="A–G" /></SelectTrigger>
              <SelectContent>
                {['A','B','C','D','E','F','G'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.epc_rating && ['F','G'].includes(form.epc_rating) && (
              <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Below minimum E — not lawful to let</p>
            )}
          </Field>
          <Field label="EPC Expiry Date" hint="Valid 10 years">
            <Input type="date" value={form.epc_expiry_date || ''} onChange={e => set('epc_expiry_date', e.target.value)} />
            <ExpiryAlert dateStr={form.epc_expiry_date} />
          </Field>
        </div>
        <BoolRow label="EPC Provided to Tenant" hint="Must be given before or at tenancy start" value={form.epc_provided_to_tenant} onChange={v => set('epc_provided_to_tenant', v)} />
      </CertBlock>

      {/* Gas Safety */}
      <CertBlock title="Gas Safety Certificate (CP12)" legislation="Gas Safety Regs 1998" color="amber">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Certificate Date">
            <Input type="date" value={form.gas_safety_cert_date || ''} onChange={e => set('gas_safety_cert_date', e.target.value)} />
          </Field>
          <Field label="Expiry Date" hint="Annual — renew each year">
            <Input type="date" value={form.gas_safety_expiry_date || ''} onChange={e => set('gas_safety_expiry_date', e.target.value)} />
            <ExpiryAlert dateStr={form.gas_safety_expiry_date} />
          </Field>
        </div>
        <BoolRow label="CP12 Provided to Tenant" hint="Before or at start of tenancy / within 28 days of renewal" value={form.gas_safety_provided_to_tenant} onChange={v => set('gas_safety_provided_to_tenant', v)} />
      </CertBlock>

      {/* EICR */}
      <CertBlock title="Electrical Installation Condition Report (EICR)" legislation={isEngland ? 'SI 2020/312 (England mandatory)' : 'Best Practice (Wales)'} color="violet">
        <div className="grid grid-cols-2 gap-3">
          <Field label="EICR Date">
            <Input type="date" value={form.eicr_date || ''} onChange={e => set('eicr_date', e.target.value)} />
          </Field>
          <Field label="Expiry Date" hint="Every 5 years or per report">
            <Input type="date" value={form.eicr_expiry_date || ''} onChange={e => set('eicr_expiry_date', e.target.value)} />
            <ExpiryAlert dateStr={form.eicr_expiry_date} />
          </Field>
        </div>
        <Field label="EICR Outcome">
          <Select value={form.eicr_outcome || ''} onValueChange={v => set('eicr_outcome', v)}>
            <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="satisfactory">Satisfactory</SelectItem>
              <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          {form.eicr_outcome === 'unsatisfactory' && (
            <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Remedial works required before letting</p>
          )}
        </Field>
        <BoolRow label="EICR Provided to Tenant" hint={isEngland ? 'Within 28 days of new tenancy (England mandatory)' : 'Best practice'} value={form.eicr_provided_to_tenant} onChange={v => set('eicr_provided_to_tenant', v)} />
      </CertBlock>

      {/* Fire & Safety */}
      <CertBlock title="Fire Safety & Alarms" legislation="SI 2015/1693 / Building Safety Act 2022" color="red">
        <BoolRow label="Smoke Alarms Tested on First Day" hint="Required on each floor with living accommodation" value={form.smoke_alarms_tested} onChange={v => set('smoke_alarms_tested', v)} />
        <BoolRow label="CO Alarms Fitted" hint="Required in any room with solid fuel / gas appliance — England mandatory since Oct 2022" value={form.co_alarms_fitted} onChange={v => set('co_alarms_fitted', v)} />
        <BoolRow label="Legionella Risk Assessment Completed" hint="Landlord duty under Health & Safety at Work Act 1974" value={form.legionella_risk_assessed} onChange={v => set('legionella_risk_assessed', v)} />
      </CertBlock>

      {/* England-specific */}
      {isEngland && (
        <CertBlock title="England — Specific Requirements" legislation="Housing Act 1988 / Immigration Act 2014" color="blue">
          <BoolRow label="How to Rent Guide Provided" hint="Current version from GOV.UK — must be given at start and when updated" value={form.how_to_rent_provided} onChange={v => set('how_to_rent_provided', v)} />
          <BoolRow label="Right to Rent Check Completed" hint="Immigration Act 2014 — check and copy ID docs" value={form.right_to_rent_checked} onChange={v => set('right_to_rent_checked', v)} />
          <Field label="Right to Rent Check Date">
            <Input type="date" value={form.right_to_rent_check_date || ''} onChange={e => set('right_to_rent_check_date', e.target.value)} />
          </Field>
          <div className="flex items-start gap-2 bg-white/60 border border-blue-200 rounded p-2.5 text-xs text-blue-800 mt-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span><strong>Renters Rights Bill (2025):</strong> Section 21 no-fault evictions will be abolished when enacted. All new tenancies will become periodic. Ensure all compliance docs served correctly to use Section 8 grounds.</span>
          </div>
        </CertBlock>
      )}

      {/* Wales-specific */}
      {isWales && (
        <CertBlock title="Wales — Renting Homes Act & Rent Smart Wales" legislation="Renting Homes (Wales) Act 2016" color="red">
          <BoolRow label="Rent Smart Wales Landlord Registered" hint="Mandatory for all landlords in Wales — rentsmartales.gov.wales" value={form.rent_smart_wales_landlord_registered} onChange={v => set('rent_smart_wales_landlord_registered', v)} />
          <Field label="RSW Licence Number">
            <Input value={form.rent_smart_wales_licence_number || ''} onChange={e => set('rent_smart_wales_licence_number', e.target.value)} placeholder="RSW-XXXXXX" />
          </Field>
          <BoolRow label="Written Statement of Occupation Contract Issued" hint="Must be provided within 14 days of occupation (Renting Homes Act 2016)" value={form.renting_homes_written_statement_provided} onChange={v => set('renting_homes_written_statement_provided', v)} />
          <BoolRow label="Fitness for Human Habitation (FFHH) Confirmed" hint="Property must meet the FFHH standard under Renting Homes Act" value={form.renting_homes_fitness_for_habitation} onChange={v => set('renting_homes_fitness_for_habitation', v)} />
          <div className="flex items-start gap-2 bg-white/60 border border-red-200 rounded p-2.5 text-xs text-red-800 mt-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span><strong>Note:</strong> Wales uses "Occupation Contracts" not tenancy agreements. There are no Section 21 notices — landlords must use Contract Holder notices under the Renting Homes (Wales) Act 2016. Minimum 6-month no-fault notice period applies.</span>
          </div>
        </CertBlock>
      )}

      {/* Inventory */}
      <CertBlock title="Inventory & Check-In / Check-Out" legislation="Best Practice / Deposit Protection" color="green">
        <BoolRow label="Inventory Completed" hint="Should be independent, signed by tenant" value={form.inventory_completed} onChange={v => set('inventory_completed', v)} />
        <Field label="Inventory Date">
          <Input type="date" value={form.inventory_date || ''} onChange={e => set('inventory_date', e.target.value)} />
        </Field>
        <BoolRow label="Inventory Signed by Tenant" value={form.inventory_signed_by_tenant} onChange={v => set('inventory_signed_by_tenant', v)} />
        <BoolRow label="Check-In Completed" value={form.check_in_completed} onChange={v => set('check_in_completed', v)} />
      </CertBlock>

      {/* Periodic Inspections */}
      <CertBlock title="Periodic Property Inspections" legislation="Best Practice / Tenancy Agreement" color="blue">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Last Inspection Date">
            <Input type="date" value={form.last_periodic_inspection_date || ''} onChange={e => set('last_periodic_inspection_date', e.target.value)} />
          </Field>
          <Field label="Next Inspection Date" hint="Recommend every 3–6 months">
            <Input type="date" value={form.next_periodic_inspection_date || ''} onChange={e => set('next_periodic_inspection_date', e.target.value)} />
            <ExpiryAlert dateStr={form.next_periodic_inspection_date} />
          </Field>
        </div>
        <Field label="Inspection Notes">
          <Input value={form.periodic_inspection_notes || ''} onChange={e => set('periodic_inspection_notes', e.target.value)} placeholder="Brief notes from last inspection" />
        </Field>
      </CertBlock>

    </div>
  );
}