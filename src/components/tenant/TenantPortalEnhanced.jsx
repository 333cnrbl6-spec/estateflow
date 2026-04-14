import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Wrench, FileText, Upload, Send, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TenantMaintenanceForm from './TenantMaintenanceForm';
import TenantDocumentViewer from './TenantDocumentViewer';
import TenantMessaging from './TenantMessaging';

export default function TenantPortalEnhanced() {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [user, setUser] = useState(null);

  // Fetch current user
  const userQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      return await base44.auth.me();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch tenant data
  const tenantQuery = useQuery({
    queryKey: ['tenant', userQuery.data?.email],
    enabled: !!userQuery.data?.email,
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.filter(
        { email: userQuery.data.email },
        '-updated_date',
        1
      );
      return tenants[0] || null;
    },
  });

  // Fetch units for tenant
  const unitsQuery = useQuery({
    queryKey: ['tenant-units', tenantQuery.data?.id],
    enabled: !!tenantQuery.data?.id,
    queryFn: async () => {
      if (!tenantQuery.data) return [];
      return await base44.entities.Unit.filter(
        { id: tenantQuery.data.id },
        '-updated_date',
        10
      );
    },
  });

  const { data: tenant } = tenantQuery;
  const { data: units = [] } = unitsQuery;

  if (userQuery.isLoading || tenantQuery.isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tenant profile not found. Please contact your property manager.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome, {tenant.name}</h1>
          <p className="text-muted-foreground mt-2">Manage your rental account, submit requests, and communicate with your property manager</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Units</p>
            <p className="text-2xl font-bold text-foreground">{units.length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Account Status</p>
            <p className="text-lg font-semibold text-green-600">Active</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Message</p>
            <p className="text-lg font-semibold text-primary">Check messages</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card rounded-lg border border-border mb-8">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition-colors ${
                activeTab === 'maintenance'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Maintenance Requests
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition-colors ${
                activeTab === 'documents'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documents
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition-colors ${
                activeTab === 'messages'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'maintenance' && <TenantMaintenanceForm tenant={tenant} units={units} />}
            {activeTab === 'documents' && <TenantDocumentViewer tenant={tenant} />}
            {activeTab === 'messages' && <TenantMessaging tenant={tenant} />}
          </div>
        </div>
      </div>
    </div>
  );
}