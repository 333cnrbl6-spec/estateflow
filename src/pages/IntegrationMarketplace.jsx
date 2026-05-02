import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Link2, Check, ExternalLink } from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Send alerts & notifications to Slack channels',
    logo: '💬',
    features: ['Maintenance alerts', 'Rent reminders', 'Team notifications'],
    status: 'ready',
    scopes: ['chat:write', 'channels:read']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    description: 'Connect to 5000+ apps with Zapier workflows',
    logo: '⚡',
    features: ['Multi-app workflows', 'Custom automations', 'Data sync'],
    status: 'ready',
    scopes: ['webhook:write']
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    category: 'Data',
    description: 'Auto-sync property & financial data to Sheets',
    logo: '📊',
    features: ['Auto-sync', 'Real-time updates', 'Custom reports'],
    status: 'ready',
    scopes: ['sheets:write', 'drive:read']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Accept & manage rent payments via Stripe',
    logo: '💳',
    features: ['Payment processing', 'Invoicing', 'Webhooks'],
    status: 'connected',
    scopes: ['read_write']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Send tenant newsletters & campaigns',
    logo: '📧',
    features: ['Email campaigns', 'Segmentation', 'Analytics'],
    status: 'ready',
    scopes: ['email:write']
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    description: 'Push property docs to GitHub repos',
    logo: '🐙',
    features: ['Repo sync', 'Issue tracking', 'Webhooks'],
    status: 'ready',
    scopes: ['repo:write']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Calendar',
    description: 'Schedule maintenance & inspections to Calendar',
    logo: '📅',
    features: ['Event creation', 'Auto-reminders', 'Team sync'],
    status: 'ready',
    scopes: ['calendar:write']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'Communication',
    description: 'Send SMS notifications to tenants',
    logo: '📱',
    features: ['SMS sending', 'Two-way messaging', 'Call logs'],
    status: 'ready',
    scopes: ['sms:write']
  }
];

export default function IntegrationMarketplace() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [connectedIntegrations, setConnectedIntegrations] = useState(['stripe']);

  const filtered = INTEGRATIONS.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || int.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleConnect = async (integration) => {
    if (connectedIntegrations.includes(integration.id)) {
      setConnectedIntegrations(connectedIntegrations.filter(id => id !== integration.id));
    } else {
      // In production, this would trigger OAuth flow
      setConnectedIntegrations([...connectedIntegrations, integration.id]);
    }
  };

  const categories = [...new Set(INTEGRATIONS.map(int => int.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Link2 className="w-8 h-8 text-blue-600" />
            Integration Marketplace
          </h1>
          <p className="text-lg text-slate-600">Connect your favorite tools to Premiso</p>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search integrations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                onClick={() => setFilter(cat)}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(integration => {
            const isConnected = connectedIntegrations.includes(integration.id);
            return (
              <Card key={integration.id} className={isConnected ? 'border-green-300 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{integration.logo}</span>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-1">{integration.category}</p>
                      </div>
                    </div>
                    {isConnected && (
                      <Badge className="bg-green-600 gap-1">
                        <Check className="w-3 h-3" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700">{integration.description}</p>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {integration.features.map((feature, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="text-blue-600">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={() => handleConnect(integration)}
                    className={isConnected ? 'w-full bg-red-600 hover:bg-red-700' : 'w-full'}
                    size="sm"
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Webhook Setup */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Custom Webhooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">Build custom integrations with incoming/outgoing webhooks</p>
            <div className="bg-white p-4 rounded-lg font-mono text-xs border border-blue-200 overflow-x-auto">
              {`POST https://webhooks.premiso.io/incoming/:webhook_id`}
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Create Webhook
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}