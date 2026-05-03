import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/lib/PermissionContext';
import { AlertCircle, Play, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DeveloperAccessPortal() {
  const permissions = usePermissions();
  const DEVELOPER_EMAIL = '333cnrbl6@gmail.com'; // MUST MATCH PermissionContext
  const isDeveloper = permissions.email === DEVELOPER_EMAIL;

  // Hooks MUST be called before any early returns
  const [activeDemoType, setActiveDemoType] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    // Check active demo
    try {
      const stored = JSON.parse(localStorage.getItem('active_demo_type') || 'null');
      setActiveDemoType(stored);
    } catch {}
  }, []);

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

  const handleBuildDemo = async (demoType) => {
    setSeedLoading(true);
    try {
      // Call the appropriate seeding function
      const funcMap = {
        'regal': 'createRegalRentalsDemoUser',
        'rbm': 'createRBMDemoUser',
        'powell': 'createPowellDemoUser'
      };
      const funcName = funcMap[demoType];
      if (funcName) {
        await base44.functions.invoke(funcName, {});
        // Store active demo
        localStorage.setItem('active_demo_type', JSON.stringify(demoType));
        setActiveDemoType(demoType);
      }
    } catch (e) {
      console.error('Demo seeding failed:', e);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSwitchDemo = (demoType) => {
    localStorage.setItem('active_demo_type', JSON.stringify(demoType));
    setActiveDemoType(demoType);
    window.location.href = '/dashboard';
  };

  // Developer-only tools here
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">Developer Portal</h1>
        <p className="text-slate-600 mt-2">Manage demo environments and build pitch demos</p>

        {/* Demo Switcher */}
        <Card className="mt-8 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" /> Demo Switcher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-6">Build or switch to a pitch demo environment:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'regal', name: 'Regal Rentals', desc: 'Multi-property lettings' },
                { id: 'rbm', name: 'RBM Block Mgmt', desc: 'Block management demo' },
                { id: 'powell', name: 'Powell Portfolio', desc: 'Complex relationships' }
              ].map(demo => (
                <div key={demo.id} className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-slate-900 mb-1">{demo.name}</h3>
                  <p className="text-xs text-slate-600 mb-4">{demo.desc}</p>
                  {activeDemoType === demo.id ? (
                    <>
                      <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mb-2">✓ Active</p>
                      <Button size="sm" variant="outline" onClick={() => handleSwitchDemo(demo.id)} className="w-full">
                        View Demo
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => handleBuildDemo(demo.id)} disabled={seedLoading} className="w-full">
                      <Play className="w-3 h-3 mr-2" /> {seedLoading ? 'Building...' : 'Build Demo'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle>Admin & Sales Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">Developer capabilities:</p>
            <ul className="mt-4 space-y-2">
              <li>• Build & switch between demo environments</li>
              <li>• View subscription data isolation</li>
              <li>• Test permission gates</li>
              <li>• Review branding system</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}