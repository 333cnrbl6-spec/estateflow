import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';

export default function SubscriberView() {
  const { tier, modules, email } = usePermissions();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // BACKEND REQUIREMENT:
    // This function MUST only return data for the authenticated user
    // NEVER expose other users' data via this endpoint
    try {
      // const response = await base44.functions.invoke('loadCurrentUserSubscription', {});
      // setData(response.data);
      setData({
        tier,
        email,
        properties: 5, // LOAD FROM BACKEND - user's count only
        users: 2,      // LOAD FROM BACKEND - their team count only
      });
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const allModules = {
    'dashboard': 'Dashboard',
    'properties': 'Property Management',
    'tenants': 'Tenant Management',
    'reporting': 'Advanced Reporting',
    'compliance': 'Compliance',
    'api': 'API Access',
    'integrations': 'Integrations'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Subscription</h1>
          <p className="text-slate-600 mt-2">Account: {email}</p>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl capitalize">{tier} Plan</CardTitle>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold">Properties</p>
                    <p className="text-2xl font-bold text-blue-900">{data.properties}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-semibold">Team Members</p>
                    <p className="text-2xl font-bold text-green-900">{data.users}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Your Modules</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(allModules).map(([key, label]) => (
                      <div 
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          modules.includes(key) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {modules.includes(key) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={modules.includes(key) ? 'text-slate-900' : 'text-slate-500'}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}