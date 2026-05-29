import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';

function FieldInput({ field, value, onChange }) {
  const { name, type, enumValues, format } = field;

  if (enumValues && enumValues.length > 0) {
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${(field.label || name).toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {enumValues.map(v => (
            <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="flex items-center gap-2 h-9">
        <Switch checked={!!value} onCheckedChange={onChange} />
        <span className="text-sm text-muted-foreground">{value ? 'Yes' : 'No'}</span>
      </div>
    );
  }

  if (type === 'number') {
    return (
      <Input
        type="number"
        step="any"
        value={value ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
      />
    );
  }

  if (format === 'date') {
    return <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} />;
  }

  // Email auto-detection
  if (type === 'email' || name === 'email' || format === 'email') {
    return <Input type="email" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="email@example.com" />;
  }

  // Phone auto-detection
  if (type === 'phone' || name === 'phone' || name?.includes('phone') || name?.includes('mobile')) {
    return <Input type="tel" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="+44 7000 000000" />;
  }

  // Long text fields
  if (name === 'notes' || name === 'description' || name === 'details' || type === 'textarea') {
    return <Textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} className="resize-none" />;
  }

  return <Input value={value || ''} onChange={e => onChange(e.target.value)} />;
}

export default function EntityFormDialog({ open, onOpenChange, title, fields, initialData, onSave, saving }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData ? { ...initialData } : {});
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors = {};
    (fields || []).forEach(field => {
      const value = formData[field.name];
      const isEmpty = value === undefined || value === null || value === '';

      if (field.required && isEmpty) {
        newErrors[field.name] = `${field.label || field.name.replace(/_/g, ' ')} is required`;
      }
      if (!isEmpty && field.type === 'number' && isNaN(Number(value))) {
        newErrors[field.name] = `${field.label || field.name.replace(/_/g, ' ')} must be a valid number`;
      }
      // Email validation for email fields
      const isEmailField = field.type === 'email' || field.name === 'email' || field.format === 'email';
      if (!isEmpty && isEmailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field.name] = 'Enter a valid email address';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const cleaned = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) cleaned[k] = v;
    });
    onSave(cleaned);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
        </DialogHeader>

        {errorCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorCount} field{errorCount > 1 ? 's' : ''} need{errorCount === 1 ? 's' : ''} attention</span>
          </div>
        )}

        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4 py-1">
            {(fields || []).map(field => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {field.label || field.name.replace(/_/g, ' ')}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <FieldInput
                  field={field}
                  value={formData[field.name]}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, [field.name]: val }));
                    if (errors[field.name]) setErrors(prev => { const n = { ...prev }; delete n[field.name]; return n; });
                  }}
                />
                {errors[field.name] && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[80px]">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}