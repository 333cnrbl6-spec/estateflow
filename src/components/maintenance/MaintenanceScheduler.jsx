import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AvailableSlotsSuggester from './AvailableSlotsSuggester';
import { Calendar, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

export default function MaintenanceScheduler({ maintenanceId, maintenance, onScheduled }) {
  const [step, setStep] = useState('date'); // date -> slots -> confirm -> done
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);

  // Fetch maintenance details if needed
  const { data: maintenanceData } = useQuery({
    queryKey: ['maintenance', maintenanceId],
    queryFn: () => base44.entities.MaintenanceRequest.get(maintenanceId),
    enabled: !!maintenanceId && !maintenance,
  });

  const maint = maintenance || maintenanceData;

  // Fetch tenant info
  const { data: tenant } = useQuery({
    queryKey: ['tenant', maint?.tenant_id],
    queryFn: () => base44.entities.Tenant.get(maint?.tenant_id),
    enabled: !!maint?.tenant_id,
  });

  // Fetch property info
  const { data: property } = useQuery({
    queryKey: ['property', maint?.property_id],
    queryFn: () => base44.entities.Property.get(maint?.property_id),
    enabled: !!maint?.property_id,
  });

  // Send invites mutation
  const sendInvitesMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('sendSchedulingInvites', {
        maintenance_id: maintenanceId,
        contractor_id: selectedContractor.id,
        contractor_email: selectedContractor.email_address,
        contractor_name: selectedContractor.contact_name,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: selectedSlot,
        property_address: property?.address_line_1 || 'Property',
        tenant_email: tenant?.email_address,
        tenant_name: tenant?.tenant_name || 'Tenant',
        maintenance_title: maint?.title || 'Maintenance Work',
      });
    },
    onSuccess: () => {
      setStep('done');
      if (onScheduled) onScheduled();
    },
  });

  if (!maint || !property) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading maintenance details...</p>
        </CardContent>
      </Card>
    );
  }

  // Date selection step
  if (step === 'date') {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Select Appointment Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {days.map(day => (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setStep('slots');
                }}
                className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                  selectedDate?.toDateString() === day.toDateString()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="font-semibold">
                  {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                </div>
                <div className="text-xs mt-1">
                  {day.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={() => setStep('slots')}
            disabled={!selectedDate}
            className="w-full"
          >
            Continue to Available Slots
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Slots selection step
  if (step === 'slots') {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setStep('date')} className="gap-2">
          ← Back to Date Selection
        </Button>

        <AvailableSlotsSuggester
          categoryRequired={maint?.category}
          selectedDate={selectedDate}
          onSlotSelected={setSelectedSlot}
          onContractorSelected={setSelectedContractor}
        />

        {selectedSlot && selectedContractor && (
          <Button
            onClick={() => setStep('confirm')}
            className="w-full"
            size="lg"
          >
            Confirm Appointment
          </Button>
        )}
      </div>
    );
  }

  // Confirm step
  if (step === 'confirm') {
    const dateStr = selectedDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Review & Send Invites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Maintenance</p>
              <p className="font-semibold text-sm">{maint.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="font-semibold text-sm">{dateStr} at {selectedSlot}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned Contractor</p>
              <p className="font-semibold text-sm">{selectedContractor.contact_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Property</p>
              <p className="font-semibold text-sm">{property.address_line_1}</p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              Calendar invites will be sent to the contractor and tenant with appointment details.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('slots')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => sendInvitesMutation.mutate()}
              disabled={sendInvitesMutation.isPending}
              className="flex-1 gap-2"
            >
              {sendInvitesMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Invites
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Done step
  if (step === 'done') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            Appointment Scheduled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-green-700">
            ✓ Calendar invites have been sent to the contractor and tenant.
          </p>
          <p className="text-sm text-green-700">
            ✓ The maintenance request has been updated with the scheduled date and contractor.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full bg-green-600 hover:bg-green-700">
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }
}