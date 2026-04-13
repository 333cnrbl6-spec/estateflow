import React from 'react';
import { useRole } from '@/lib/RoleContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProtectedRoute({ routePath, children, fallback }) {
  const { canAccess } = useRole();

  if (!canAccess(routePath)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Alert className="max-w-md bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-semibold">Access Denied</p>
              <p className="text-sm mt-1">Your current role does not have access to this page.</p>
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  return children;
}