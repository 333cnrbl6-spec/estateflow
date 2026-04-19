import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TenantMaintenanceSubmission from '@/components/maintenance/TenantMaintenanceSubmission';
import MaintenanceManagerDashboard from '@/components/maintenance/MaintenanceManagerDashboard';
import { useAuth } from '@/lib/AuthContext';

export default function MaintenanceTracking() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isTenant = user?.role === 'tenant' || user?.type === 'tenant';
  const isManager = user?.role === 'manager' || user?.role === 'admin' || !isTenant;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Maintenance Tracking</h1>
        <p className="text-muted-foreground">Submit and manage maintenance requests</p>
      </div>

      {isTenant ? (
        <TenantMaintenanceSubmission
          tenantId={user?.id}
          propertyId={user?.property_id}
          onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        />
      ) : isManager ? (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Requests Dashboard</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4 mt-4">
            {/* Manager can view all properties */}
            <MaintenanceManagerDashboard key={refreshTrigger} propertyId="all" />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">Please log in to use the maintenance tracking system</p>
        </Card>
      )}
    </div>
  );
}