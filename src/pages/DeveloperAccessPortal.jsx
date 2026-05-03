import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { AlertCircle } from 'lucide-react';

export default function DeveloperAccessPortal() {
  const permissions = usePermissions();
  const DEVELOPER_EMAIL = '333cnrbl6@gmail.com'; // MUST MATCH PermissionContext
  const isDeveloper = permissions.email === DEVELOPER_EMAIL;

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-6 h-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              This portal is restricted to authorized developers only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Developer-only tools here
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">Developer Portal</h1>
        
        <Card className="mt-8 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle>Admin & Sales Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">Add your app-specific developer tools here:</p>
            <ul className="mt-4 space-y-2">
              <li>• Sales materials management</li>
              <li>• Marketing asset generation</li>
              <li>• Demo data seeding</li>
              <li>• System configuration</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}