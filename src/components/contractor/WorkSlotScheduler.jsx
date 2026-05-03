import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WorkSlotScheduler({ maintenanceId, tenantEmail, tenantPhone, onScheduleComplete }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState('2');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
    '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const durationOptions = ['1', '1.5', '2', '2.5', '3', '4', '8'];

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledDatetime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDatetime.setHours(parseInt(hours), parseInt(minutes));

      // Update maintenance record with scheduled slot
      await base44.entities.MaintenanceRequest.update(maintenanceId, {
        scheduled_date: scheduledDatetime.toISOString().split('T')[0],
        scheduled_time: selectedTime,
        estimated_duration_hours: parseFloat(duration),
        notes: notes || 'Scheduled by contractor'
      });

      // Notify tenant
      if (tenantEmail) {
        await base44.functions.invoke('sendSchedulingInvites', {
          tenant_email: tenantEmail,
          maintenance_id: maintenanceId,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          duration_hours: duration,
          contractor_phone: tenantPhone
        });
      }

      if (onScheduleComplete) {
        onScheduleComplete({
          date: selectedDate,
          time: selectedTime,
          duration: duration
        });
      }

      // Reset form
      setSelectedDate(null);
      setSelectedTime('09:00');
      setDuration('2');
      setNotes('');
    } catch (err) {
      setError(err.message || 'Failed to schedule work slot');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Schedule Work Slot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            min={getMinDate()}
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Time Picker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Start Time
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {timeSlots.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estimated Duration (hours)
          </label>
          <div className="flex gap-2 flex-wrap">
            {durationOptions.map(dur => (
              <button
                key={dur}
                onClick={() => setDuration(dur)}
                className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                  duration === dur
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dur}h
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes for Tenant (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Please ensure access to water, may cause noise..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Scheduled:</span> {new Date(selectedDate).toLocaleDateString()} at {selectedTime} ({duration}h)
            </p>
          </div>
        )}

        {/* Actions */}
        <Button
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime || loading}
          className="w-full gap-2"
        >
          <Clock className="w-4 h-4" />
          {loading ? 'Scheduling...' : 'Schedule & Notify Tenant'}
        </Button>
      </CardContent>
    </Card>
  );
}