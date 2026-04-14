import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Calendar, Plus, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function InspectionScheduler({ onScheduleCreated }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    property_id: '',
    unit_id: '',
    inspection_type: 'general',
    scheduled_date: '',
    recurrence: 'none',
    recurrence_interval: 1,
    recurrence_unit: 'months',
    notes: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-inspection'],
    queryFn: () => base44.entities.Property.list('-updated_date', 50)
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units-for-inspection', formData.property_id],
    queryFn: () => formData.property_id ? 
      base44.entities.Unit.filter({ property_id: formData.property_id }, 'unit_number', 50) : 
      Promise.resolve([]),
    enabled: !!formData.property_id
  });

  const scheduleInspectionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.functions.invoke('scheduleInspection', data);
    },
    onSuccess: (result) => {
      setSuccessMessage('Inspection scheduled successfully! Tenant notifications will be sent.');
      setFormData({
        property_id: '',
        unit_id: '',
        inspection_type: 'general',
        scheduled_date: '',
        recurrence: 'none',
        recurrence_interval: 1,
        recurrence_unit: 'months',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      onScheduleCreated?.();
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.property_id || !formData.scheduled_date) {
      alert('Please fill in required fields');
      return;
    }
    scheduleInspectionMutation.mutate(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-2 p-6">
        <h2 className="text-lg font-semibold mb-6 text-foreground">Schedule Inspection</h2>
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Property *</label>
            <select
              value={formData.property_id}
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value, unit_id: '' })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              required
            >
              <option value="">Select a property</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id}>
                  {prop.address}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Selection */}
          {formData.property_id && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Unit (Optional)</label>
              <select
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">All units</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unit_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Inspection Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Inspection Type</label>
            <select
              value={formData.inspection_type}
              onChange={(e) => setFormData({ ...formData, inspection_type: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="general">General Condition</option>
              <option value="routine">Routine Maintenance</option>
              <option value="move_in">Move-In</option>
              <option value="move_out">Move-Out</option>
              <option value="safety">Safety Check</option>
            </select>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Inspection Date *</label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              required
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Recurrence</label>
            <select
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="none">One-time only</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          {formData.recurrence === 'recurring' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Every</label>
                <input
                  type="number"
                  min="1"
                  value={formData.recurrence_interval}
                  onChange={(e) => setFormData({ ...formData, recurrence_interval: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Period</label>
                <select
                  value={formData.recurrence_unit}
                  onChange={(e) => setFormData({ ...formData, recurrence_unit: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any specific areas of focus or special instructions..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
              rows="3"
            />
          </div>

          <Button 
            type="submit" 
            disabled={scheduleInspectionMutation.isPending}
            className="w-full"
          >
            {scheduleInspectionMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Inspection
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200 h-fit">
        <h3 className="font-semibold text-foreground mb-4">About Inspections</h3>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">Tenant Notification</p>
            <p>Tenants receive automated notifications with access confirmation request.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Mobile Checklist</p>
            <p>Conduct inspections on-site with our digital checklist system.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Recurring Inspections</p>
            <p>Set up periodic inspections that automatically schedule on your timeline.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Compliance</p>
            <p>Maintain inspection records for regulatory and insurance purposes.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}