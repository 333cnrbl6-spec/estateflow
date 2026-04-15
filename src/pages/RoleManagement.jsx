import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import RoleManagementPanel from '@/components/admin/RoleManagementPanel';
import { useRole } from '@/lib/RoleContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function RoleManagement() {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Role Management"
          subtitle="Manage user roles and permissions"
          icon="Shield"
        />
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You do not have permission to access this page. Contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      <PageHeader
        title="Role Management"
        subtitle="Centralized admin panel for managing user roles and permissions"
        icon="Shield"
      />

      {/* Info Banner */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Note:</strong> Role assignments are validated on the backend. Frontend role changes are for UI purposes only. 
          All sensitive operations require backend authentication and authorization.
        </AlertDescription>
      </Alert>

      {/* Role Management Panel */}
      <RoleManagementPanel />
    </div>
  );
}