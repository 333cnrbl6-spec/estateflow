import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2, CheckCircle2, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ISSUE_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing / Water Leak' },
  { value: 'electrical', label: 'Electrical / Power Issue' },
  { value: 'heating', label: 'Heating / Boiler' },
  { value: 'structural', label: 'Structural Damage / Cracks' },
  { value: 'pest', label: 'Pest Control' },
  { value: 'damp', label: 'Damp / Mold' },
  { value: 'safety', label: 'Safety Concern' },
  { value: 'fire_safety', label: 'Fire Safety Issue' },
  { value: 'other', label: 'Other' }
];

const PRIORITY_LEVELS = [
  { value: 'routine', label: 'Routine (within 7 days)', description: 'Non-urgent maintenance' },
  { value: 'important', label: 'Important (within 48 hours)', description: 'Needs attention soon' },
  { value: 'urgent', label: 'Urgent (same day)', description: 'Significant issue' }
];

export default function MaintenanceReportForm({ 
  propertyId, 
  unitId, 
  propertyAddress,
  fireSafetyStatus,
  fireRiskLevel
}) {
  const [formData, setFormData] = useState({
    category: '',
    priority: 'important',
    description: '',
    location: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create maintenance request
      const maintenanceRequest = await base44.entities.MaintenanceRequest.create({
        property_id: propertyId,
        unit_id: unitId,
        title: `${ISSUE_CATEGORIES.find(c => c.value === formData.category)?.label || 'Maintenance Issue'} - Tenant Report`,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'open',
        reported_by: 'tenant',
        location: formData.location,
        tenant_phone: formData.contactPhone,
        linked_to_fire_safety: formData.category.includes('fire') || formData.category === 'safety',
        fire_risk_context: {
          fire_safety_status: fireSafetyStatus,
          fire_risk_level: fireRiskLevel,
          linked_to_assessment: !!fireRiskLevel
        }
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          category: '',
          priority: 'important',
          description: '',
          location: '',
          contactPhone: ''
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="text-lg font-semibold text-green-900 dark:text-green-100">Issue Reported Successfully</p>
        <p className="text-sm text-green-700 dark:text-green-200 mt-2">
          Your maintenance request has been submitted. You'll be contacted shortly with updates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Report an Urgent Issue</h3>

      {/* Fire Safety Alert */}
      {fireRiskLevel === 'high' && (
        <div className="mb-6 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">High Fire Risk Level Detected</p>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                This property has been assessed as high fire risk. Please report any fire-related issues immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Issue Category *</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select issue type..." />
            </SelectTrigger>
            <SelectContent>
              {ISSUE_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-3">Priority Level *</label>
          <div className="space-y-2">
            {PRIORITY_LEVELS.map(level => (
              <label key={level.value} className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="priority"
                  value={level.value}
                  checked={formData.priority === level.value}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-foreground">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Location in Property *</label>
          <Input
            placeholder="e.g., Kitchen, Master Bedroom, Bathroom"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Description of Issue *</label>
          <Textarea
            placeholder="Please describe the issue in detail, including when you first noticed it..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-32"
            required
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Contact Phone Number</label>
          <Input
            type="tel"
            placeholder="Your phone number"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !formData.category || !formData.location || !formData.description}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Submit Maintenance Report
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Urgent issues will be prioritized. A member of our team will contact you shortly.
        </p>
      </form>
    </div>
  );
}