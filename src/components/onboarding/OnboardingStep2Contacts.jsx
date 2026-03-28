import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES = [
  { id: 'manager', label: 'Property Manager' },
  { id: 'director', label: 'Director' },
  { id: 'office_manager', label: 'Office Manager' },
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'other', label: 'Other' },
];

function ContactForm({ contact, onChange, label, subtitle }) {
  return (
    <Card className="border border-border">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">{label}</Label>
          {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
        </div>

        <div>
          <Label htmlFor={`${label}-name`} className="text-xs font-medium mb-1 block">
            Full Name *
          </Label>
          <Input
            id={`${label}-name`}
            placeholder="John Smith"
            value={contact.name}
            onChange={(e) => onChange({ ...contact, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor={`${label}-phone`} className="text-xs font-medium mb-1 block">
            Phone Number *
          </Label>
          <Input
            id={`${label}-phone`}
            placeholder="+44 7700 900000"
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor={`${label}-email`} className="text-xs font-medium mb-1 block">
            Email Address *
          </Label>
          <Input
            id={`${label}-email`}
            type="email"
            placeholder="john@company.com"
            value={contact.email}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor={`${label}-role`} className="text-xs font-medium mb-1 block">
            Role *
          </Label>
          <Select value={contact.role} onValueChange={(value) => onChange({ ...contact, role: value })}>
            <SelectTrigger id={`${label}-role`}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OnboardingStep2Contacts({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">📞 Contact Details:</span> We'll use these contacts to escalate urgent
          after-hours issues. Make sure phone numbers are mobile and regularly monitored.
        </p>
      </div>

      <ContactForm
        contact={formData.primaryContact}
        onChange={(contact) => updateFormData('primaryContact', contact)}
        label="Primary Contact"
        subtitle="First point of contact for escalations"
      />

      <ContactForm
        contact={formData.secondaryContact}
        onChange={(contact) => updateFormData('secondaryContact', contact)}
        label="Secondary Contact"
        subtitle="Backup contact if primary is unavailable"
      />

      <Card className="bg-secondary/30 border-secondary">
        <CardContent className="pt-6">
          <Label htmlFor="emergency-phone" className="text-sm font-semibold mb-2 block">
            Emergency Contact Phone (Optional)
          </Label>
          <p className="text-xs text-muted-foreground mb-4">
            If different from the contacts above, provide a direct emergency number
          </p>
          <Input
            id="emergency-phone"
            placeholder="+44 7700 900000"
            value={formData.emergencyContactPhone}
            onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">✓ Best Practice:</span> Ensure all contacts have enabled call forwarding
          and have the EstateFlow app installed on their phones.
        </p>
      </div>
    </div>
  );
}