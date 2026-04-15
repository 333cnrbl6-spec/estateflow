import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const EPC_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function WizardStepCompliance({ data, onChange }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Compliance Information</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Record key certificate expiry dates and legal requirements. All fields optional but recommended.
      </p>

      <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Premiso will automatically alert you before certificates expire. Enter dates you already have to start tracking immediately.
        </p>
      </div>

      <div className="space-y-6">
        {/* Gas Safety */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Gas Safety Certificate (CP12)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" className="mt-1" value={data.gas_safety_expiry}
                onChange={e => onChange({ gas_safety_expiry: e.target.value })} />
            </div>
          </div>
        </section>

        {/* EICR */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Electrical Installation Condition Report (EICR)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Next Inspection Due</Label>
              <Input type="date" className="mt-1" value={data.eicr_expiry}
                onChange={e => onChange({ eicr_expiry: e.target.value })} />
            </div>
          </div>
        </section>

        {/* EPC */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Energy Performance Certificate (EPC)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Current Rating</Label>
              <Select value={data.epc_rating} onValueChange={v => onChange({ epc_rating: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  {EPC_RATINGS.map(r => <SelectItem key={r} value={r}>Rating {r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" className="mt-1" value={data.epc_expiry}
                onChange={e => onChange({ epc_expiry: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Fire Risk */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Fire Risk Assessment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Last Assessment Date</Label>
              <Input type="date" className="mt-1" value={data.fire_risk_assessment_date}
                onChange={e => onChange({ fire_risk_assessment_date: e.target.value })} />
            </div>
          </div>
        </section>

        {/* HMO */}
        <section>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-3">
            <Switch
              checked={data.hmo_licensed}
              onCheckedChange={v => onChange({ hmo_licensed: v })}
            />
            <div>
              <Label className="cursor-pointer">HMO Licensed Property</Label>
              <p className="text-xs text-muted-foreground">House in Multiple Occupation license required</p>
            </div>
          </div>
          {data.hmo_licensed && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
              <div>
                <Label>License Expiry Date</Label>
                <Input type="date" className="mt-1" value={data.hmo_license_expiry}
                  onChange={e => onChange({ hmo_license_expiry: e.target.value })} />
              </div>
              <div>
                <Label>Max Occupants</Label>
                <Input type="number" className="mt-1" placeholder="e.g. 5" value={data.hmo_max_occupants}
                  onChange={e => onChange({ hmo_max_occupants: e.target.value })} />
              </div>
            </div>
          )}
        </section>

        {/* Asbestos */}
        <section>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-3">
            <Switch
              checked={data.asbestos_survey}
              onCheckedChange={v => onChange({ asbestos_survey: v })}
            />
            <div>
              <Label className="cursor-pointer">Asbestos Survey Completed</Label>
              <p className="text-xs text-muted-foreground">Required for pre-2000 properties</p>
            </div>
          </div>
          {data.asbestos_survey && (
            <div className="pl-4 border-l-2 border-primary/30">
              <Label>Survey Date</Label>
              <Input type="date" className="mt-1 max-w-xs" value={data.asbestos_survey_date}
                onChange={e => onChange({ asbestos_survey_date: e.target.value })} />
            </div>
          )}
        </section>

        {/* Legionella */}
        <section>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-3">
            <Switch
              checked={data.legionella_risk_assessment}
              onCheckedChange={v => onChange({ legionella_risk_assessment: v })}
            />
            <div>
              <Label className="cursor-pointer">Legionella Risk Assessment</Label>
              <p className="text-xs text-muted-foreground">Required for landlords under ACOP L8</p>
            </div>
          </div>
          {data.legionella_risk_assessment && (
            <div className="pl-4 border-l-2 border-primary/30">
              <Label>Assessment Date</Label>
              <Input type="date" className="mt-1 max-w-xs" value={data.legionella_date}
                onChange={e => onChange({ legionella_date: e.target.value })} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}