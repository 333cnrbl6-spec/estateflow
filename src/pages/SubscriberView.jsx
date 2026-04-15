import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, Wrench, DollarSign, AlertTriangle } from 'lucide-react';

export default function SubscriberView() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch core data
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: () => base44.entities.MaintenanceRequest.list(),
  });

  const { data: financialTransactions = [] } = useQuery({
    queryKey: ['financialTransactions'],
    queryFn: () => base44.entities.FinancialTransaction.list(),
  });

  const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied_units || 0), 0);
  const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 0), 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const pendingMaintenance = maintenanceRequests.filter(m => m.status !== 'completed').length;

  const subscriberZones = [
    {
      label: 'Core Operations',
      icon: Home,
      routes: [
        { label: 'Properties', path: '/properties' },
        { label: 'Units', path: '/units' },
        { label: 'Contacts', path: '/contacts' },
      ],
    },
    {
      label: 'Tenant Management',
      icon: Users,
      routes: [
        { label: 'Tenants', path: '/tenants' },
        { label: 'Screening', path: '/tenant-screening' },
        { label: 'Portal', path: '/tenant-portal' },
      ],
    },
    {
      label: 'Maintenance & Operations',
      icon: Wrench,
      routes: [
        { label: 'Maintenance Board', path: '/maintenance-board' },
        { label: 'Scheduling', path: '/maintenance-scheduling' },
        { label: 'Forecasting', path: '/maintenance-forecasting' },
      ],
    },
    {
      label: 'Finance & Accounting',
      icon: DollarSign,
      routes: [
        { label: 'Financials', path: '/financials' },
        { label: 'Rent Ledger', path: '/rent-ledger' },
        { label: 'Reports', path: '/financial-reporting' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Premiso Subscriber View</h1>
            <p className="text-sm text-muted-foreground">Core operations dashboard</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(window.location.href, '_blank')}
          >
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{properties.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{occupancyRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{occupiedUnits}/{totalUnits} units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tenants.length}</p>
            </CardContent>
          </Card>

          <Card className={pendingMaintenance > 0 ? 'border-amber-200 bg-amber-50' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                {pendingMaintenance > 0 && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${pendingMaintenance > 0 ? 'text-amber-600' : ''}`}>
                {pendingMaintenance}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Zones */}
        <div className="grid md:grid-cols-2 gap-6">
          {subscriberZones.map((zone, i) => {
            const IconComp = zone.icon;
            return (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <IconComp className="w-5 h-5" />
                    <CardTitle className="text-base">{zone.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {zone.routes.map((route, j) => (
                    <Link key={j} to={route.path}>
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                        {route.label}
                      </Button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {financialTransactions.slice(0, 5).length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            ) : (
              <div className="space-y-2">
                {financialTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">{tx.description}</p>
                    <Badge variant="outline">£{(tx.amount / 100).toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}