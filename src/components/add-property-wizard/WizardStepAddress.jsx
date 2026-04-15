import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REGIONS = [
  { value: 'london', label: 'London' },
  { value: 'brighton', label: 'Brighton' },
  { value: 'blackpool', label: 'Blackpool' },
  { value: 'ipswich', label: 'Ipswich' },
  { value: 'leeds', label: 'Leeds' },
  { value: 'kettering', label: 'Kettering' },
  { value: 'north_wales', label: 'North Wales' },
  { value: 'lancashire', label: 'Lancashire' },
  { value: 'morecambe', label: 'Morecambe' },
  { value: 'bolton', label: 'Bolton' },
  { value: 'colne', label: 'Colne' },
  { value: 'other', label: 'Other' },
];

export default function WizardStepAddress({ data, onChange }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Address & Region</h2>
      <p className="text-sm text-muted-foreground mb-6">Full property address for compliance and correspondence.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Label htmlFor="addr1">Address Line 1</Label>
          <Input
            id="addr1"
            className="mt-1"
            placeholder="House number and street"
            value={data.address_line_1}
            onChange={e => onChange({ address_line_1: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="addr2">Address Line 2</Label>
          <Input
            id="addr2"
            className="mt-1"
            placeholder="Apartment, suite, building (optional)"
            value={data.address_line_2}
            onChange={e => onChange({ address_line_2: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="city">City / Town</Label>
          <Input
            id="city"
            className="mt-1"
            placeholder="e.g. Manchester"
            value={data.city}
            onChange={e => onChange({ city: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            className="mt-1"
            placeholder="e.g. M1 1AA"
            value={data.postcode}
            onChange={e => onChange({ postcode: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Region</Label>
          <Select value={data.region} onValueChange={v => onChange({ region: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select region" /></SelectTrigger>
            <SelectContent>
              {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}