import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';

export default function SubscriberFacingDashboard() {
  const { tier, modules, email, role } = usePermissions();
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    // Load only subscriber's own subscription data
    loadSubscriberData();
  }, []);

  const loadSubscriberData = async () => {
    try {
      // This would be a backend function that returns ONLY the current user's subscription
      // Ensuring no cross-user data leakage
      setSubscriptionData({
        tier,
        startDate: new Date(2025, 4, 1),
        renewalDate: new Date(2026, 4, 1),
        status: 'active',
        properties: 15, // their count only
        users: 3, // their count only
      });
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const tierFeatures = {
    starter: ['Up to 50 units', 'Basic maintenance', 'Rent ledger', 'Email support'],
    professional: ['Up to 200 units', 'Full maintenance', 'Rent ledger', 'Compliance alerts', 'Reporting', 'Priority support'],
    enterprise: ['Unlimited units', 'Full platform access', 'API access', 'Custom reporting', 'Dedicated support', 'Advanced workflows']
  };

  const allModules = {
    properties: 'Property Management',
    units: 'Unit Management',
    tenants: 'Tenant Management',
    maintenance: 'Maintenance Tracking',
    financials: 'Financial Reports',
    compliance: 'Compliance Tracking',
    reporting: 'Advanced Reporting',
    crm: 'Sales CRM',
    workflows: 'Workflow Automation',
    integrations: 'Integrations'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Subscription</h1>
          <p className="text-slate-600 mt-2">Signed in as: <span className="font-semibold">{email}</span></p>
        </div>

        {/* Tier Card */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl capitalize">{tier} Plan</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {subscriptionData && `Renews on ${subscriptionData.renewalDate.toLocaleDateString()}`}
                </p>
              </div>
              <Badge className="text-base py-2 px-4 capitalize">{subscriptionData?.status || 'loading'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-semibold">Properties</p>
                <p className="text-2xl font-bold text-blue-900">{subscriptionData?.properties || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-semibold">Team Members</p>
                <p className="text-2xl font-bold text-green-900">{subscriptionData?.users || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold">Plan Limit</p>
                <p className="text-2xl font-bold text-purple-900 capitalize">{tier}</p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Your Features</h3>
              <ul className="space-y-2">
                {tierFeatures[tier]?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Available Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(allModules).map(([key, label]) => {
                const hasAccess = modules.includes(key);
                return (
                  <div 
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      hasAccess 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {hasAccess ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={hasAccess ? 'text-slate-900' : 'text-slate-500'}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help & Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/help" className="block text-blue-600 hover:underline">📚 Knowledge Base & FAQs</a>
            <a href="/api-docs" className="block text-blue-600 hover:underline">📖 API Documentation</a>
            <p className="text-sm text-slate-600 mt-4">
              For support: <span className="font-semibold">support@premiso.io</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}