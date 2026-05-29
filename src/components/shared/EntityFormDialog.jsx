import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

function FieldInput({ field, value, onChange, options }) {
  const { name, type, enumValues, format } = field;
  
  if (enumValues && enumValues.length > 0) {
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={`Select ${name}`} /></SelectTrigger>
        <SelectContent>
          {enumValues.map(v => (
            <SelectItem key={v} value={v}>{v.replace(/_/g, ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === 'boolean') {
    return <Switch checked={!!value} onCheckedChange={onChange} />;
  }

  if (type === 'number') {
    return <Input type="number" step="any" value={value ?? ''} onChange={e => onChange(e.target.value ? Number(e.target.value) : '')} />;
  }

  if (format === 'date') {
    return <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} />;
  }

  if (name === 'notes' || name === 'description') {
    return <Textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} />;
  }

  return <Input value={value || ''} onChange={e => onChange(e.target.value)} />;
}

export default function EntityFormDialog({ open, onOpenChange, title, fields, initialData, onSave, saving }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData || {});
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors = {};
    (fields || []).forEach(field => {
      const value = formData[field.name];
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }
      if (field.type === 'number' && value !== undefined && value !== '' && isNaN(Number(value))) {
        newErrors[field.name] = `${field.label || field.name} must be a valid number`;
      }
      if (field.format === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field.name] = `${field.label || field.name} must be a valid email`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // Strip empty strings for optional fields, keep required ones
    const cleaned = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) cleaned[k] = v;
    });
    onSave(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
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
                    if (errors[field.name]) setErrors(prev => ({ ...prev, [field.name]: undefined }));
                  }}
                />
                {errors[field.name] && (
                  <p className="text-xs text-destructive">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}