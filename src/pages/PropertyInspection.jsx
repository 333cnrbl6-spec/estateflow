import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Calendar, ClipboardList, Bell } from 'lucide-react';
import InspectionScheduler from '@/components/inspection/InspectionScheduler';
import InspectionChecklist from '@/components/inspection/InspectionChecklist';
import InspectionHistory from '@/components/inspection/InspectionHistory';

export default function PropertyInspection() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScheduleCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Property Inspections</h1>
          <p className="text-muted-foreground mt-1">Schedule, conduct, and manage property inspections</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="conduct" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Conduct</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <InspectionScheduler onScheduleCreated={handleScheduleCreated} />
          </TabsContent>

          <TabsContent value="conduct" className="space-y-6">
            <InspectionChecklist refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <InspectionHistory refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}