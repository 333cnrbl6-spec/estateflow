import React from 'react';
import { format, isBefore } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScheduledAppointmentsList({ appointments, contractors }) {
  const now = new Date();

  const categorizeAppointments = () => {
    const upcoming = [];
    const overdue = [];

    appointments.forEach(apt => {
      const aptDate = new Date(`${apt.scheduled_date}T${apt.scheduled_time || '09:00'}`);
      if (isBefore(aptDate, now)) {
        overdue.push(apt);
      } else {
        upcoming.push(apt);
      }
    });

    return {
      upcoming: upcoming.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)),
      overdue: overdue.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date)),
    };
  };

  const { upcoming, overdue } = categorizeAppointments();

  const getContractorName = (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor?.name || 'Unknown Contractor';
  };

  const AppointmentCard = ({ appointment, isOverdue }) => (
    <div className={`rounded-lg border p-4 ${
      isOverdue
        ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
        : 'bg-card border-border'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{appointment.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{appointment.description}</p>
          
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold">Contractor</p>
              <p>{appointment.assigned_contractor_name}</p>
            </div>
            <div>
              <p className="font-semibold">Scheduled</p>
              <p>{format(new Date(appointment.scheduled_date), 'dd MMM yyyy')} at {appointment.scheduled_time || '09:00'}</p>
            </div>
            <div>
              <p className="font-semibold">Category</p>
              <p>{appointment.category}</p>
            </div>
            <div>
              <p className="font-semibold">Priority</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                appointment.priority === 'urgent' || appointment.priority === 'emergency'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
              }`}>
                {appointment.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {isOverdue ? (
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              Overdue
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
              <Clock className="w-4 h-4" />
              Upcoming
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // In a real app, this would open a detail/edit modal
              alert(`View details for: ${appointment.title}`);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground mb-2">No scheduled appointments</p>
        <p className="text-sm text-muted-foreground">All available maintenance tasks have been scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Upcoming Appointments ({upcoming.length})
          </h4>
          <div className="space-y-3">
            {upcoming.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} isOverdue={false} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Overdue Appointments ({overdue.length})
          </h4>
          <div className="space-y-3">
            {overdue.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} isOverdue={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}