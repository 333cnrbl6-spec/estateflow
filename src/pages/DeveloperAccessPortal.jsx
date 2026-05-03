import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/lib/PermissionContext';
import { AlertCircle } from 'lucide-react';

export default function DeveloperAccessPortal() {
  const permissions = usePermissions();
  const DEVELOPER_EMAIL = '333cnrbl6@gmail.com';
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

  const devAreas = [
    { title: 'Sales Materials', path: '/sales-brochure', desc: 'Sales collateral, pitch decks, one-pagers' },
    { title: 'Marketing Assets', path: '/marketing-assets', desc: 'Email templates, social media, graphics' },
    { title: 'Demo Switcher', path: '/dev-demo-switcher', desc: 'Switch between demo data profiles' },
    { title: 'API Documentation', path: '/api-docs', desc: 'Technical API reference for integrations' },
    { title: 'Developer Docs', path: '/developer-documents', desc: 'Architecture, code standards, guides' },
    { title: 'Bulk Import Tester', path: '/bulk-import-tester', desc: 'Test data import workflows' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Developer Portal</h1>
          <p className="text-slate-600 mt-2">
            Authenticated as: <span className="font-semibold text-indigo-600">{permissions.email}</span>
            <Badge className="ml-2">Developer Access</Badge>
          </p>
        </div>

        {/* Developer Tools */}
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle>Sales & Marketing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {devAreas.map((area, i) => (
                <a
                  key={i}
                  href={area.path}
                  className="block p-4 border rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition"
                >
                  <h3 className="font-semibold text-slate-900">{area.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{area.desc}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Access */}
        <Card>
          <CardHeader>
            <CardTitle>System Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/settings" className="block text-indigo-600 hover:underline font-semibold">⚙️ Global Settings</a>
            <a href="/team" className="block text-indigo-600 hover:underline font-semibold">👥 Team Management</a>
            <a href="/role-management" className="block text-indigo-600 hover:underline font-semibold">🔐 Role & Permissions</a>
            <a href="/error-monitoring" className="block text-indigo-600 hover:underline font-semibold">🚨 Error Logs</a>
          </CardContent>
        </Card>

        {/* Access Level Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Your Access Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>✓ Sales & Marketing materials</p>
            <p>✓ Developer tools and documentation</p>
            <p>✓ Demo data management</p>
            <p>✓ System administration (admin endpoints only)</p>
            <p>✓ Bulk import testing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}