import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Bell } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import ContractorAvailabilityView from '@/components/contractor-scheduling/ContractorAvailabilityView';
import TaskAssignmentForm from '@/components/contractor-scheduling/TaskAssignmentForm';
import ScheduledAppointmentsList from '@/components/contractor-scheduling/ScheduledAppointmentsList';

export default function ContractorScheduling() {
  const [activeTab, setActiveTab] = useState('assignments');

  // Fetch contractors
  const contractorsQuery = useQuery({
    queryKey: ['contractors'],
    queryFn: () => base44.entities.Contact.filter(
      { contact_type: 'contractor' },
      '-updated_date',
      100
    ),
  });

  // Fetch maintenance requests
  const maintenanceQuery = useQuery({
    queryKey: ['unassigned-maintenance'],
    queryFn: () => base44.entities.MaintenanceRequest.filter(
      { status: 'reported' },
      '-created_date',
      100
    ),
  });

  // Fetch scheduled appointments
  const appointmentsQuery = useQuery({
    queryKey: ['scheduled-appointments'],
    queryFn: async () => {
      const all = await base44.entities.MaintenanceRequest.filter(
        { status: 'assigned' },
        '-scheduled_date',
        100
      );
      return all.filter(a => a.assigned_date);
    },
  });

  const { data: contractors = [] } = contractorsQuery;
  const { data: unassignedMaintenance = [] } = maintenanceQuery;
  const { data: appointments = [] } = appointmentsQuery;

  const isLoading = contractorsQuery.isLoading || maintenanceQuery.isLoading || appointmentsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading scheduling interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Contractor Scheduling"
          subtitle={`Manage ${contractors.length} contractors and ${appointments.length} scheduled appointments`}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Contractors</p>
                <p className="text-2xl font-bold text-foreground">{contractors.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-20" />
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pending Assignments</p>
                <p className="text-2xl font-bold text-foreground">{unassignedMaintenance.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500 opacity-20" />
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Scheduled Appointments</p>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
              </div>
              <Bell className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card rounded-lg border border-border mb-8">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'assignments'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Assign Tasks
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'availability'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'scheduled'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Scheduled ({appointments.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'assignments' && (
              <TaskAssignmentForm
                unassignedMaintenance={unassignedMaintenance}
                contractors={contractors}
              />
            )}
            {activeTab === 'availability' && (
              <ContractorAvailabilityView contractors={contractors} />
            )}
            {activeTab === 'scheduled' && (
              <ScheduledAppointmentsList 
                appointments={appointments}
                contractors={contractors}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}