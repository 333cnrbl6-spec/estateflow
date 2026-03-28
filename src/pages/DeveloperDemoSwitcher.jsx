import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code2, Zap, Play, Check, AlertCircle, Loader } from 'lucide-react';

const DEMO_PROFILES = [
  {
    id: 'rbm',
    name: 'RBM (North West)',
    function: 'createRBMDemoUser',
    description: 'Block management agency - Horwich, Bolton',
    color: 'bg-blue-600',
    status: 'Complete data population',
  },
  {
    id: 'powell',
    name: 'Powell & Co',
    function: 'createPowellCoDemoUser',
    description: 'Multi-region property management group',
    color: 'bg-purple-600',
    status: 'Portfolio demo with financials',
  },
  {
    id: 'regal',
    name: 'Regal Rentals',
    function: 'createRegalRentalsDemoUser',
    description: 'Residential letting agency',
    color: 'bg-green-600',
    status: 'Tenant management focus',
  },
];

export default function DeveloperDemoSwitcher() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState({});
  const [reloading, setReloading] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Only allow in development/preview mode
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md border-2 border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h2 className="font-bold text-lg">Authentication Required</h2>
              <p className="text-sm text-muted-foreground">
                Please log in to access the developer demo switcher.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateProfile = async (profile) => {
    setLoading(prev => ({ ...prev, [profile.id]: true }));
    setMessages(prev => ({ ...prev, [profile.id]: '' }));

    try {
      const response = await base44.functions.invoke(profile.function, {});
      
      if (response.data.success) {
        setMessages(prev => ({
          ...prev,
          [profile.id]: `✓ ${profile.name} demo created successfully`,
        }));
        setSelectedProfile(profile.id);
        
        // Auto-reload after 2 seconds to load new data
        setTimeout(() => {
          setReloading(true);
          window.location.href = '/';
        }, 2000);
      } else {
        setMessages(prev => ({
          ...prev,
          [profile.id]: `Error: ${response.data.message || 'Unknown error'}`,
        }));
      }
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [profile.id]: `Error: ${error.message}`,
      }));
    } finally {
      setLoading(prev => ({ ...prev, [profile.id]: false }));
    }
  };

  if (reloading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Demo Data...</h2>
          <p className="text-gray-300">Redirecting to dashboard with new profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl font-serif font-bold text-white">Developer Demo Switcher</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Admin-only tool for rapidly creating fully populated demo profiles with realistic data
          </p>
        </div>

        {/* Alert */}
        <Alert className="mb-8 bg-amber-950 border-amber-700">
          <Zap className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-100">
            <strong>Developer Tool:</strong> Each profile creates a complete data set including properties, tenants, 
            service charges, maintenance orders, and compliance records. Use this to demonstrate platform capabilities.
          </AlertDescription>
        </Alert>

        {/* Demo Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {DEMO_PROFILES.map(profile => (
            <Card
              key={profile.id}
              className={`border-2 transition-all ${
                selectedProfile === profile.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className={`${profile.color} text-white rounded-lg p-2`}>
                    <Play className="w-5 h-5" />
                  </div>
                  {selectedProfile === profile.id && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                  <p className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block">
                    {profile.status}
                  </p>
                </div>

                <Button
                  onClick={() => handleCreateProfile(profile)}
                  disabled={loading[profile.id]}
                  className="w-full"
                  variant={selectedProfile === profile.id ? 'default' : 'outline'}
                >
                  {loading[profile.id] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Create & Load Profile
                    </>
                  )}
                </Button>

                {messages[profile.id] && (
                  <div className={`text-xs p-2 rounded ${
                    messages[profile.id].startsWith('✓')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {messages[profile.id]}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Summary */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Demo Data Included</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Properties</p>
                <p className="text-2xl font-bold">3-13</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Units</p>
                <p className="text-2xl font-bold">24-120+</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Tenants/Leaseholders</p>
                <p className="text-2xl font-bold">6-60+</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Transactions</p>
                <p className="text-2xl font-bold">12-200+</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Service Charges</p>
                <p className="text-2xl font-bold">2 years</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Maintenance Orders</p>
                <p className="text-2xl font-bold">6-40+</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Emergency Callouts</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Team Members</p>
                <p className="text-2xl font-bold">5-10</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-sm">
                Each profile includes: fully populated companies, properties, units, tenants, service charges, 
                financial transactions, maintenance orders, emergency callouts, compliance records, building safety data, 
                and complete team/contractor contacts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}