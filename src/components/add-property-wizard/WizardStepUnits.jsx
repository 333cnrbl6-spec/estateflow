import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Home } from 'lucide-react';

const UNIT_TYPES = ['flat', 'apartment', 'penthouse', 'studio', 'maisonette', 'house', 'commercial'];
const TENURES = ['leasehold', 'freehold', 'assured_shorthold', 'assured', 'regulated'];

const emptyUnit = () => ({
  unit_reference: '',
  unit_type: '',
  tenure: '',
  floor: '',
  bedrooms: '',
  monthly_rent: '',
  status: 'vacant',
});

export default function WizardStepUnits({ units, onChange }) {
  const [expanded, setExpanded] = useState(null);

  const addUnit = () => {
    const next = [...units, emptyUnit()];
    onChange(next);
    setExpanded(next.length - 1);
  };

  const removeUnit = (idx) => {
    onChange(units.filter((_, i) => i !== idx));
    setExpanded(null);
  };

  const updateUnit = (idx, field, value) => {
    const updated = units.map((u, i) => i === idx ? { ...u, [field]: value } : u);
    onChange(updated);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-1">Units</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Add individual units within this property. You can skip this and add units later.
      </p>

      <div className="space-y-3 mb-4">
        {units.map((unit, idx) => (
          <div key={idx} className="border border-border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {unit.unit_reference || `Unit ${idx + 1}`}
                </span>
                {unit.unit_type && <span className="text-xs text-muted-foreground capitalize">· {unit.unit_type}</span>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => { e.stopPropagation(); removeUnit(idx); }}
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {expanded === idx && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border">
                <div>
                  <Label>Unit Reference <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Flat 1, Apartment A"
                    value={unit.unit_reference}
                    onChange={e => updateUnit(idx, 'unit_reference', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Unit Type</Label>
                  <Select value={unit.unit_type} onValueChange={v => updateUnit(idx, 'unit_type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tenure</Label>
                  <Select value={unit.tenure} onValueChange={v => updateUnit(idx, 'tenure', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {TENURES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Floor</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. Ground, 1st, 2nd"
                    value={unit.floor}
                    onChange={e => updateUnit(idx, 'floor', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Bedrooms</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={unit.bedrooms}
                    onChange={e => updateUnit(idx, 'bedrooms', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Monthly Rent (£)</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    placeholder="0.00"
                    value={unit.monthly_rent}
                    onChange={e => updateUnit(idx, 'monthly_rent', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addUnit} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" />
        Add Unit
      </Button>

      {units.length === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          No units added yet — you can add them now or after saving the property.
        </p>
      )}
    </div>
  );
}