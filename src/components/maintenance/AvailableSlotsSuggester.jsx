import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function AvailableSlotsSuggester({ 
  categoryRequired, 
  selectedDate, 
  onSlotSelected,
  onContractorSelected 
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);

  // Fetch all contractors and their workload
  const { data: contractors = [], isLoading } = useQuery({
    queryKey: ['contractors', categoryRequired],
    queryFn: async () => {
      const allContractors = await base44.entities.Contact.filter(
        { contact_type: 'contractor' },
        '-created_date',
        100
      );
      
      // Fetch their certifications and workload
      const withDetails = await Promise.all(
        allContractors.map(async (contractor) => {
          const certifications = await base44.entities.Certification.filter(
            { contractor_id: contractor.id },
            'type',
            50
          );
          
          const workload = await base44.entities.MaintenanceRequest.filter(
            {
              assigned_contractor_id: contractor.id,
              status: ['assigned', 'in_progress']
            },
            'scheduled_date',
            100
          );

          return {
            ...contractor,
            certifications,
            workload,
          };
        })
      );

      // Filter by required category/certification
      if (categoryRequired) {
        return withDetails.filter(c =>
          c.certifications?.some(cert =>
            cert.type?.toLowerCase().includes(categoryRequired?.toLowerCase())
          )
        );
      }
      return withDetails;
    },
    enabled: !!categoryRequired,
  });

  // Calculate available slots for each contractor
  const availableSlots = useMemo(() => {
    if (!selectedDate || !contractors.length) return {};

    const slots = {};
    
    contractors.forEach(contractor => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const contractorScheduledDates = (contractor.workload || [])
        .filter(maint => maint.scheduled_date?.startsWith(dateStr))
        .map(maint => maint.scheduled_date);

      const available = TIME_SLOTS.filter(time => {
        const slotDateTime = `${dateStr}T${time}:00`;
        
        // Check if slot is already booked (within 2 hour window)
        const isBooked = contractorScheduledDates.some(bookedTime => {
          const bookedHour = parseInt(bookedTime.split('T')[1]);
          const slotHour = parseInt(time);
          return Math.abs(bookedHour - slotHour) < 2;
        });

        return !isBooked;
      });

      slots[contractor.id] = {
        contractor,
        available,
        workloadCount: contractor.workload?.length || 0,
      };
    });

    return slots;
  }, [selectedDate, contractors]);

  if (!categoryRequired) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-700">Select a maintenance category to see available contractors and slots.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Analyzing contractor availability...</span>
        </CardContent>
      </Card>
    );
  }

  const slots = availableSlots;

  if (Object.keys(slots).length === 0) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            No Qualified Contractors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            No contractors have the required certification for this type of work.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Available Time Slots
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2">
          {selectedDate?.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(slots).map(([contractorId, { contractor, available, workloadCount }]) => (
          <div key={contractorId} className="border rounded-lg p-4">
            {/* Contractor Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900">{contractor.contact_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {workloadCount} job{workloadCount !== 1 ? 's' : ''} scheduled
                  </Badge>
                  {available.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {available.length} available
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Time Slots */}
            {available.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {available.map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedSlot(time);
                      setSelectedContractor(contractor);
                      onSlotSelected(time);
                      onContractorSelected(contractor);
                    }}
                    className={`p-2 rounded border text-xs font-medium transition-all ${
                      selectedSlot === time && selectedContractor?.id === contractorId
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-slate-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No available slots for this date
              </div>
            )}
          </div>
        ))}

        {/* Selection Summary */}
        {selectedSlot && selectedContractor && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-green-900">Slot Selected</p>
              <p className="text-green-700 text-xs mt-1">
                {selectedContractor.contact_name} at {selectedSlot}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}