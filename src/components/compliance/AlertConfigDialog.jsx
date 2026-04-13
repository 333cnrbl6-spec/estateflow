import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Bell, Mail, Users, Save, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CERT_TYPES = {
  all: 'All Certificates',
  gas_safety: 'Gas Safety (CP12)',
  eicr: 'Electrical (EICR)',
  fire_safety: 'Fire Safety',
  asbestos: 'Asbestos Survey',
  legionella: 'Legionella Risk',
  pat_testing: 'PAT Testing',
  boiler_service: 'Boiler Service',
  lift_safety: 'Lift Safety',
  other: 'Other'
};

const RECIPIENT_TYPES = [
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'maintenance_team', label: 'Maintenance Team' },
  { value: 'compliance_officer', label: 'Compliance Officer' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'custom', label: 'Custom Email' },
];

export default function AlertConfigDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);

  const { data: existingConfigs = [] } = useQuery({
    queryKey: ['alert-configs'],
    queryFn: () => base44.entities.ComplianceAlertConfig.list('-created_date'),
    enabled: open,
  });

  React.useEffect(() => {
    if (existingConfigs.length > 0) {
      setConfigs(existingConfigs);
    } else {
      // Default configs
      setConfigs([
        {
          certificate_type: 'all',
          threshold_days: 60,
          enabled: true,
          notify_email: true,
          notify_dashboard: true,
          recipients: ['property_manager'],
          custom_email: '',
        },
        {
          certificate_type: 'gas_safety',
          threshold_days: 30,
          enabled: true,
          notify_email: true,
          notify_dashboard: true,
          recipients: ['property_manager', 'compliance_officer'],
          custom_email: '',
        },
      ]);
    }
  }, [existingConfigs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete existing configs
      const existing = await base44.entities.ComplianceAlertConfig.list();
      await Promise.all(existing.map(c => base44.entities.ComplianceAlertConfig.delete(c.id)));
      
      // Create new configs
      const validConfigs = configs.filter(c => c.enabled);
      await Promise.all(validConfigs.map(c => 
        base44.entities.ComplianceAlertConfig.create({
          certificate_type: c.certificate_type,
          threshold_days: c.threshold_days,
          notify_email: c.notify_email,
          notify_dashboard: c.notify_dashboard,
          recipients: c.recipients,
          custom_email: c.custom_email || null,
          enabled: true,
        })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configs'] });
      toast.success('Alert configuration saved');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to save configuration: ' + error.message);
    }
  });

  const updateConfig = (index, updates) => {
    setConfigs(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const addConfig = () => {
    setConfigs(prev => [...prev, {
      certificate_type: 'gas_safety',
      threshold_days: 30,
      enabled: true,
      notify_email: false,
      notify_dashboard: true,
      recipients: ['property_manager'],
      custom_email: '',
    }]);
  };

  const removeConfig = (index) => {
    setConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setLoading(true);
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Configure Certificate Expiry Alerts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Alert Configuration</p>
                <p>Set thresholds and notification preferences for certificate expiry alerts. Alerts will be sent automatically based on these settings.</p>
              </div>
            </div>
          </div>

          {configs.map((config, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Alert Rule #{index + 1}</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enabled-${index}`} className="text-xs">Enabled</Label>
                  <Switch
                    id={`enabled-${index}`}
                    checked={config.enabled}
                    onCheckedChange={(checked) => updateConfig(index, { enabled: checked })}
                  />
                </div>
              </div>

              {config.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Certificate Type</Label>
                      <Select 
                        value={config.certificate_type} 
                        onValueChange={(val) => updateConfig(index, { certificate_type: val })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CERT_TYPES).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs mb-1.5 block">Alert Threshold (Days Before Expiry)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={config.threshold_days}
                        onChange={(e) => updateConfig(index, { threshold_days: parseInt(e.target.value) || 30 })}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`email-${index}`}
                        checked={config.notify_email}
                        onCheckedChange={(checked) => updateConfig(index, { notify_email: checked })}
                      />
                      <Label htmlFor={`email-${index}`} className="flex items-center gap-1.5 cursor-pointer">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Email Notifications</span>
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`dashboard-${index}`}
                        checked={config.notify_dashboard}
                        onCheckedChange={(checked) => updateConfig(index, { notify_dashboard: checked })}
                      />
                      <Label htmlFor={`dashboard-${index}`} className="flex items-center gap-1.5 cursor-pointer">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm">Dashboard Alerts</span>
                      </Label>
                    </div>
                  </div>

                  {(config.notify_email || config.notify_dashboard) && (
                    <div>
                      <Label className="text-xs mb-2 block flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Notification Recipients
                      </Label>
                      <div className="space-y-2">
                        {RECIPIENT_TYPES.map(type => (
                          <div key={type.value} className="flex items-center gap-2">
                            <Switch
                              id={`recipient-${index}-${type.value}`}
                              checked={config.recipients?.includes(type.value)}
                              onCheckedChange={(checked) => {
                                const current = config.recipients || [];
                                const updated = checked 
                                  ? [...current, type.value]
                                  : current.filter(r => r !== type.value);
                                updateConfig(index, { recipients: updated });
                              }}
                            />
                            <Label htmlFor={`recipient-${index}-${type.value}`} className="text-sm cursor-pointer">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.recipients?.includes('custom') && (
                    <div>
                      <Label className="text-xs mb-1.5 block">Custom Email Address</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={config.custom_email || ''}
                        onChange={(e) => updateConfig(index, { custom_email: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  )}
                </>
              )}

              {configs.length > 1 && (
                <div className="pt-2 border-t">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeConfig(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove Rule
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button 
            type="button" 
            variant="outline" 
            onClick={addConfig}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Alert Rule
          </Button>
        </div>

        <div className="flex gap-2 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}