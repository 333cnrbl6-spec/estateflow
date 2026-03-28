import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';

const TIERS = [
  { value: 'basic', label: 'Basic', description: 'Log & Email' },
  { value: 'standard', label: 'Standard', description: 'Log & Maintenance Orders' },
  { value: 'premium', label: 'Premium', description: '+ Contractor Dispatch' },
  { value: 'enterprise', label: 'Enterprise', description: 'Full Managed Service' }
];

const FEATURES = [
  { id: 'log_and_email', label: 'Log & Email', tier: 'basic' },
  { id: 'maintenance_order_creation', label: 'Create Maintenance Orders', tier: 'standard' },
  { id: 'contractor_dispatch', label: 'Dispatch Contractors', tier: 'premium' },
  { id: 'emergency_response', label: 'Emergency Response', tier: 'premium' },
  { id: 'callback_scheduling', label: 'Callback Scheduling', tier: 'standard' }
];

export default function ServiceConfiguration({ companyId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    service_tier: 'standard',
    is_active: true,
    monthly_cost: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['outOfHoursServices', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const all = await base44.entities.OutOfHoursService.list();
      return all.filter(s => s.company_id === companyId);
    },
    enabled: !!companyId
  });

  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.OutOfHoursService.create({
      company_id: companyId,
      ...data,
      monthly_cost: parseFloat(data.monthly_cost) || 0,
      call_handling_options: getOptionsForTier(data.service_tier)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outOfHoursServices'] });
      resetForm();
      setShowDialog(false);
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.OutOfHoursService.update(data.id, {
      service_tier: data.service_tier,
      is_active: data.is_active,
      monthly_cost: parseFloat(data.monthly_cost),
      call_handling_options: getOptionsForTier(data.service_tier)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outOfHoursServices'] });
      resetForm();
      setShowDialog(false);
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.OutOfHoursService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outOfHoursServices'] });
    }
  });

  const getOptionsForTier = (tier) => {
    return FEATURES.filter(f => {
      const tierIndex = TIERS.findIndex(t => t.value === tier);
      const featureTierIndex = TIERS.findIndex(t => t.value === f.tier);
      return featureTierIndex <= tierIndex;
    }).map(f => f.id);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      service_tier: service.service_tier,
      is_active: service.is_active,
      monthly_cost: service.monthly_cost?.toString() || ''
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.service_name || !formData.service_tier) return;
    
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...formData });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      service_name: '',
      service_tier: 'standard',
      is_active: true,
      monthly_cost: '',
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const getTierBadgeColor = (tier) => {
    const colors = {
      basic: 'bg-slate-100 text-slate-900',
      standard: 'bg-blue-100 text-blue-900',
      premium: 'bg-purple-100 text-purple-900',
      enterprise: 'bg-amber-100 text-amber-900'
    };
    return colors[tier] || 'bg-gray-100';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <CardTitle>Service Configuration</CardTitle>
        </div>
        <Button 
          size="sm" 
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Service
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No services configured yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{service.service_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getTierBadgeColor(service.service_tier)}`}>
                        {TIERS.find(t => t.value === service.service_tier)?.label}
                      </span>
                      <StatusBadge status={service.is_active ? 'active' : 'inactive'} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      £{service.monthly_cost?.toFixed(2) || '0.00'}/month
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.call_handling_options?.map((opt) => {
                        const feature = FEATURES.find(f => f.id === opt);
                        return (
                          <span 
                            key={opt}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {feature?.label || opt}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(service)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteServiceMutation.mutate(service.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add Out-of-Hours Service'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm">Service Name</Label>
              <Input 
                placeholder="e.g. 24/7 Emergency Support"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Service Tier</Label>
              <Select value={formData.service_tier} onValueChange={(value) => setFormData({ ...formData, service_tier: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label} - {tier.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Monthly Cost (£)</Label>
              <Input 
                type="number"
                placeholder="0.00"
                value={formData.monthly_cost}
                onChange={(e) => setFormData({ ...formData, monthly_cost: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs font-medium mb-2">Included Features:</p>
              <div className="flex flex-wrap gap-1">
                {getOptionsForTier(formData.service_tier).map((opt) => {
                  const feature = FEATURES.find(f => f.id === opt);
                  return (
                    <span 
                      key={opt}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      ✓ {feature?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.service_name}
            >
              {editingService ? 'Update' : 'Create'} Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}