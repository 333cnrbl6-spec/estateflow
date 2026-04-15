import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const PROPERTY_TYPES = [
  { value: 'freehold_block', label: 'Freehold Block' },
  { value: 'leasehold_block', label: 'Leasehold Block' },
  { value: 'house', label: 'House' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
  { value: 'converted_building', label: 'Converted Building' },
  { value: 'rtm_block', label: 'RTM Block' },
];

const OWNERSHIP_TYPES = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'commonhold', label: 'Commonhold' },
];

export default function WizardStepPropertyDetails({ data, onChange }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Property Details</h2>
      <p className="text-sm text-muted-foreground mb-6">Basic information about the property.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Property Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            className="mt-1"
            placeholder="e.g. Admiral Point, 14 Reed Close"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
          />
        </div>

        <div>
          <Label>Property Type</Label>
          <Select value={data.property_type} onValueChange={v => onChange({ property_type: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Ownership Type</Label>
          <Select value={data.ownership_type} onValueChange={v => onChange({ ownership_type: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select ownership" /></SelectTrigger>
            <SelectContent>
              {OWNERSHIP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year_built">Year Built</Label>
          <Input
            id="year_built"
            className="mt-1"
            type="number"
            placeholder="e.g. 1985"
            value={data.year_built}
            onChange={e => onChange({ year_built: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="total_units">Number of Units</Label>
          <Input
            id="total_units"
            className="mt-1"
            type="number"
            min="1"
            placeholder="1"
            value={data.total_units}
            onChange={e => onChange({ total_units: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Switch
            id="listed"
            checked={data.listed_building}
            onCheckedChange={v => onChange({ listed_building: v })}
          />
          <div>
            <Label htmlFor="listed" className="cursor-pointer">Listed Building</Label>
            <p className="text-xs text-muted-foreground">Grade I, II* or II listed status applies</p>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            className="mt-1"
            placeholder="Any additional notes about this property..."
            value={data.notes}
            onChange={e => onChange({ notes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}