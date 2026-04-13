import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RentReminderSettings({ tenantId, propertyId, unitId }) {
  const [gracePeriod, setGracePeriod] = useState(3);
  const [frequency, setFrequency] = useState(7);
  const [method, setMethod] = useState('email');
  const [maxReminders, setMaxReminders] = useState(3);
  const [isActive, setIsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  // Fetch existing reminder settings
  const { data: reminderSettings } = useQuery({
    queryKey: ['rent-reminder', tenantId],
    queryFn: async () => {
      const settings = await base44.entities.RentPaymentReminder.filter(
        { tenant_id: tenantId },
        '-updated_date',
        1
      );
      return settings[0] || null;
    },
    enabled: !!tenantId,
    onSuccess: (data) => {
      if (data) {
        setGracePeriod(data.grace_period_days || 3);
        setFrequency(data.reminder_frequency_days || 7);
        setMethod(data.notification_method || 'email');
        setMaxReminders(data.max_reminders || 3);
        setIsActive(data.is_active !== false);
      }
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (reminderSettings?.id) {
        // Update existing
        return base44.entities.RentPaymentReminder.update(reminderSettings.id, {
          grace_period_days: parseInt(gracePeriod),
          reminder_frequency_days: parseInt(frequency),
          notification_method: method,
          max_reminders: parseInt(maxReminders),
          is_active: isActive,
        });
      } else {
        // Create new
        return base44.entities.RentPaymentReminder.create({
          tenant_id: tenantId,
          property_id: propertyId,
          unit_id: unitId,
          grace_period_days: parseInt(gracePeriod),
          reminder_frequency_days: parseInt(frequency),
          notification_method: method,
          max_reminders: parseInt(maxReminders),
          is_active: isActive,
        });
      }
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Rent Payment Reminders
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2">Configure automatic notifications for overdue rent</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm font-semibold text-slate-900">Reminders</p>
            <p className="text-xs text-muted-foreground">
              {isActive ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-green-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Grace Period */}
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-2 block">
            Grace Period (days)
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Days after rent due date before first reminder is sent
          </p>
          <Input
            type="number"
            min="0"
            max="30"
            value={gracePeriod}
            onChange={(e) => setGracePeriod(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-slate-600 mt-2">
            First reminder will be sent {gracePeriod} days after due date
          </p>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-2 block">
            Reminder Frequency (days)
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Days between follow-up reminders
          </p>
          <Input
            type="number"
            min="1"
            max="30"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Notification Method */}
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-2 block">
            Notification Method
          </label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="both">Email & SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Reminders */}
        <div>
          <label className="text-sm font-semibold text-slate-900 mb-2 block">
            Maximum Reminders
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Number of reminders before escalation to property manager
          </p>
          <Input
            type="number"
            min="1"
            max="10"
            value={maxReminders}
            onChange={(e) => setMaxReminders(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Summary */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-sm">
            Reminders will be sent via {method === 'both' ? 'email and SMS' : method} every {frequency} days, 
            starting {gracePeriod} days after the due date, up to {maxReminders} times.
          </AlertDescription>
        </Alert>

        {saved && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-sm">
              Settings saved successfully
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
          size="lg"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Reminder Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}