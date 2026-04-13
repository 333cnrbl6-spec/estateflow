import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Code2, Zap, Play, Check, AlertCircle, Loader, Sparkles, Building2 } from 'lucide-react';

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
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    },
  });

  const { data: allCompanies = [] } = useQuery({
    queryKey: ['demo-switcher-companies'],
    queryFn: () => base44.entities.Company.list('-created_date', 200),
  });

  const { data: allProperties = [] } = useQuery({
    queryKey: ['demo-switcher-properties'],
    queryFn: () => base44.entities.Property.list('-created_date', 500),
  });

  const dynamicDemos = allCompanies.map(c => ({
    id: c.id,
    name: c.name,
    description: c.registered_address || c.category || 'Custom demo',
    propCount: allProperties.filter(p => p.owning_company === c.id).length,
    createdDate: c.created_date,
  }));

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md border-2 border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h2 className="font-bold text-lg">Authentication Required</h2>
              <p className="text-sm text-muted-foreground">Please log in to access the developer demo switcher.</p>
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
        setMessages(prev => ({ ...prev, [profile.id]: `✓ ${profile.name} demo created successfully` }));
        setSelectedProfile(profile.id);
        queryClient.invalidateQueries({ queryKey: ['demo-switcher-companies'] });
        queryClient.invalidateQueries({ queryKey: ['demo-switcher-properties'] });
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          setReloading(true);
          window.location.href = '/';
        }, 2000);
      } else {
        setMessages(prev => ({ ...prev, [profile.id]: `Error: ${response.data.message || 'Unknown error'}` }));
      }
    } catch (error) {
      setMessages(prev => ({ ...prev, [profile.id]: `Error: ${error.message}` }));
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

        {/* Sales Demo Builder CTA */}
        <Card className="mb-6 border-amber-600 bg-amber-950/40 cursor-pointer hover:bg-amber-950/60 transition-colors" onClick={() => navigate('/sales-demo-setup')}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="text-white font-semibold">Sales Demo Builder</p>
                  <p className="text-amber-300 text-sm">Research any UK letting agent or property company and auto-build a tailored demo</p>
                </div>
              </div>
              <Play className="w-5 h-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        {/* Alert */}
        <Alert className="mb-8 bg-amber-950 border-amber-700">
          <Zap className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-100">
            <strong>Developer Tool:</strong> Each profile creates a complete data set including properties, tenants,
            service charges, maintenance orders, and compliance records.
          </AlertDescription>
        </Alert>

        {/* Dynamic Demos from Sales Demo Builder */}
        {dynamicDemos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Created Demos ({dynamicDemos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dynamicDemos.map(demo => {
                const isActive = currentUser?.current_demo_company_id === demo.id;
                return (
                  <Card
                    key={demo.id}
                    className={`border-2 transition-all ${isActive ? 'border-green-500 bg-green-950/50' : 'border-slate-600 hover:border-slate-500 bg-slate-800/60'}`}
                  >
                    <CardContent className="pt-5 pb-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-base">{demo.name}</h3>
                          <p className="text-slate-400 text-xs mt-1">{demo.description}</p>
                        </div>
                        {isActive && <Badge className="bg-green-600 text-white text-xs">Active</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>{demo.propCount} properties</span>
                        {demo.createdDate && <span>Created {new Date(demo.createdDate).toLocaleDateString()}</span>}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={isActive ? 'default' : 'outline'}
                        disabled={isActive}
                        onClick={async () => {
                          await base44.auth.updateMe({ current_demo_company_id: demo.id });
                          queryClient.invalidateQueries();
                          window.location.href = '/';
                        }}
                      >
                        {isActive
                          ? <><Check className="w-3.5 h-3.5 mr-1" /> Active</>
                          : <><Play className="w-3.5 h-3.5 mr-1" /> Switch To</>
                        }
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Demo Profiles */}
        <h2 className="text-white font-semibold text-lg mb-4">Quick Demo Profiles</h2>
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
                  {selectedProfile === profile.id && <Check className="w-5 h-5 text-green-600" />}
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                  <p className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block">{profile.status}</p>
                </div>
                <Button
                  onClick={() => handleCreateProfile(profile)}
                  disabled={loading[profile.id]}
                  className="w-full"
                  variant={selectedProfile === profile.id ? 'default' : 'outline'}
                >
                  {loading[profile.id] ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Creating...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" />Create & Load Profile</>
                  )}
                </Button>
                {messages[profile.id] && (
                  <div className={`text-xs p-2 rounded ${messages[profile.id].startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
              {[
                { label: 'Properties', value: '3-13' },
                { label: 'Units', value: '24-120+' },
                { label: 'Tenants/Leaseholders', value: '6-60+' },
                { label: 'Transactions', value: '12-200+' },
                { label: 'Service Charges', value: '2 years' },
                { label: 'Maintenance Orders', value: '6-40+' },
                { label: 'Emergency Callouts', value: '3' },
                { label: 'Team Members', value: '5-10' },
              ].map(item => (
                <div key={item.label} className="bg-slate-700/50 p-3 rounded">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              ))}
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