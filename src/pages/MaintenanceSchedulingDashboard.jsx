import React from 'react';
import MaintenanceScheduleCalendar from '@/components/maintenance/MaintenanceScheduleCalendar';
import PageHeader from '@/components/shared/PageHeader';

export default function MaintenanceSchedulingDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Maintenance Scheduling"
          subtitle="Drag and drop tasks to assign them to vendors based on availability, location, and trade type"
        />
        <MaintenanceScheduleCalendar />
      </div>
    </div>
  );
}