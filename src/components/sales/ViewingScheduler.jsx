import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, MapPin, CheckCircle, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ViewingScheduler({ listingId, leadId, onClose }) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [appointmentType, setAppointmentType] = useState('first_viewing');
  const [scheduledDate, setScheduledDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [locationType, setLocationType] = useState('in_person');
  const [meetingInstructions, setMeetingInstructions] = useState('');
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const queryClient = useQueryClient();

  const createViewingMutation = useMutation({
    mutationFn: async (viewingData) => {
      const viewing = await base44.entities.ViewingAppointment.create(viewingData);
      
      if (sendConfirmation) {
        await base44.functions.invoke('confirmViewingAppointment', {
          viewing_id: viewing.id,
        });
      }
      
      return viewing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      toast.success('Viewing scheduled successfully');
      onClose?.();
    },
  });

  const handleSchedule = async () => {
    if (!contactName || !contactEmail || !scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user = await base44.auth.me();
    
    createViewingMutation.mutate({
      sales_listing_id: listingId,
      sales_lead_id: leadId,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      agent_id: user.id,
      agent_name: user.full_name,
      appointment_type: appointmentType,
      scheduled_date: scheduledDate,
      duration_minutes: duration,
      location_type: locationType,
      meeting_instructions: meetingInstructions,
      status: 'confirmed',
    });
  };

  const appointmentTypes = [
    { value: 'first_viewing', label: 'First Viewing', icon: '🏠' },
    { value: 'second_viewing', label: 'Second Viewing', icon: '🏠' },
    { value: 'virtual_tour', label: 'Virtual Tour', icon: '💻' },
    { value: 'phone_consultation', label: 'Phone Consultation', icon: '📞' },
    { value: 'property_valuation', label: 'Property Valuation', icon: '📊' },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Schedule Viewing</CardTitle>
              <CardDescription>Book an appointment for property viewing</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Contact Name *</label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email *</label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Phone</label>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+44 7700 900000"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Appointment Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {appointmentTypes.map((type) => (
              <Button
                key={type.value}
                variant={appointmentType === type.value ? 'default' : 'outline'}
                className="h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => setAppointmentType(type.value)}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Date & Time *</label>
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Location Type</label>
          <div className="flex gap-2">
            {[
              { value: 'in_person', label: 'In Person', icon: MapPin },
              { value: 'virtual', label: 'Virtual', icon: Calendar },
              { value: 'phone', label: 'Phone', icon: Phone },
            ].map((loc) => (
              <Button
                key={loc.value}
                variant={locationType === loc.value ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLocationType(loc.value)}
              >
                <loc.icon className="w-4 h-4 mr-2" />
                {loc.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Meeting Instructions</label>
          <Textarea
            value={meetingInstructions}
            onChange={(e) => setMeetingInstructions(e.target.value)}
            placeholder="E.g., Meet at main entrance, key code is 1234, call on arrival..."
            className="min-h-[80px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendConfirmation"
            checked={sendConfirmation}
            onChange={(e) => setSendConfirmation(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sendConfirmation" className="text-sm cursor-pointer flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send email & SMS confirmation automatically
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSchedule} 
            disabled={createViewingMutation.isPending || !contactName || !contactEmail || !scheduledDate}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {createViewingMutation.isPending ? 'Scheduling...' : 'Schedule Viewing'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}