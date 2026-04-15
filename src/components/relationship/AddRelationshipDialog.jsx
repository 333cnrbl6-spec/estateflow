import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';

const RELATIONSHIP_TYPES = [
  { value: 'director_of', label: 'Director of' },
  { value: 'psc_of', label: 'PSC / Beneficial Owner of' },
  { value: 'owns_freehold', label: 'Owns Freehold of' },
  { value: 'holds_leasehold', label: 'Holds Leasehold of' },
  { value: 'manages_block', label: 'Manages Block' },
  { value: 'collects_ground_rent', label: 'Collects Ground Rent for' },
  { value: 'letting_agent_for', label: 'Letting Agent for' },
  { value: 'rtm_company_for', label: 'RTM Company for' },
  { value: 'tenant_of', label: 'Tenant of' },
  { value: 'beneficial_owner_of', label: 'Beneficial Owner of' },
  { value: 'shareholder_of', label: 'Shareholder of' },
  { value: 'secretary_of', label: 'Secretary of' },
];

const ENTITY_TYPES = [
  { value: 'person', label: 'Person / Individual' },
  { value: 'company', label: 'Company' },
  { value: 'property', label: 'Property / Building' },
  { value: 'unit', label: 'Unit / Apartment' },
];

const SOURCES = [
  { value: 'companies_house', label: 'Companies House' },
  { value: 'land_registry', label: 'Land Registry' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'onboarding', label: 'Onboarding Import' },
];

const empty = {
  from_label: '',
  from_entity_type: 'person',
  from_entity_id: '',
  to_label: '',
  to_entity_type: 'company',
  to_entity_id: '',
  relationship_type: 'director_of',
  relationship_label: '',
  conflict_of_interest: false,
  conflict_description: '',
  verified: false,
  source: 'manual',
  notes: '',
};

export default function AddRelationshipDialog({ open, onClose, onSaved, subscriberCompanyId }) {
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const relType = RELATIONSHIP_TYPES.find(r => r.value === form.relationship_type);
    await base44.entities.OwnershipRelationship.create({
      ...form,
      relationship_label: form.relationship_label || relType?.label || form.relationship_type,
      from_entity_id: form.from_entity_id || `manual_${Date.now()}_from`,
      to_entity_id: form.to_entity_id || `manual_${Date.now()}_to`,
      subscriber_company_id: subscriberCompanyId || '',
    });
    setSaving(false);
    setForm({ ...empty });
    onSaved?.();
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* FROM */}
          <div className="p-3 bg-muted/40 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input placeholder="e.g. Sean Powell" value={form.from_label} onChange={e => set('from_label', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={form.from_entity_type} onValueChange={v => set('from_entity_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ENTITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* RELATIONSHIP */}
          <div className="space-y-1">
            <Label className="text-xs">Relationship</Label>
            <Select value={form.relationship_type} onValueChange={v => set('relationship_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{RELATIONSHIP_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* TO */}
          <div className="p-3 bg-muted/40 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input placeholder="e.g. JD Property (Blackpool) Ltd" value={form.to_label} onChange={e => set('to_label', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={form.to_entity_type} onValueChange={v => set('to_entity_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ENTITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Source & Verified */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Data Source</Label>
              <Select value={form.source} onValueChange={v => set('source', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch checked={form.verified} onCheckedChange={v => set('verified', v)} />
              <Label className="text-xs">Verified</Label>
            </div>
          </div>

          {/* Conflict of Interest */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch checked={form.conflict_of_interest} onCheckedChange={v => set('conflict_of_interest', v)} />
              <Label className="text-xs">Flag Conflict of Interest</Label>
            </div>
            {form.conflict_of_interest && (
              <Input
                placeholder="Describe the conflict..."
                value={form.conflict_description}
                onChange={e => set('conflict_description', e.target.value)}
              />
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Input placeholder="Any additional context..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.from_label || !form.to_label}>
            {saving ? 'Saving...' : 'Add Relationship'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}