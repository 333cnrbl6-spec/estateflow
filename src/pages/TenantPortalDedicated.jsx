import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Wrench, FileText, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MaintenanceRequestForm from '@/components/tenant/MaintenanceRequestForm';
import RequestStatusTracker from '@/components/tenant/RequestStatusTracker';
import AnnouncementsPanel from '@/components/tenant/AnnouncementsPanel';
import DocumentsViewer from '@/components/tenant/DocumentsViewer';

export default function TenantPortalDedicated() {
  const [tenant, setTenant] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPortal = async () => {
      try {
        // Get tenant from URL or auth token
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          setError('No access token provided');
          setLoading(false);
          return;
        }

        // Fetch tenant data using token (this would be verified server-side in production)
        const tenantData = localStorage.getItem(`tenant_${token}`);
        if (!tenantData) {
          setError('Invalid or expired access token');
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(tenantData);
        setTenant(parsed);

        // Fetch property data
        if (parsed.property_id) {
          const propData = await base44.entities.Property.get(parsed.property_id);
          setProperty(propData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initPortal();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-blue-700 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-bold text-foreground">Access Error</h1>
          </div>
          <p className="text-muted-foreground mb-6">{error || 'Unable to load tenant data'}</p>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tenant Portal</h1>
              <p className="text-muted-foreground mt-1">
                Welcome, {tenant.full_name}
                {property && ` • ${property.address}`}
              </p>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Updates</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <MaintenanceRequestForm tenant={tenant} property={property} />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <RequestStatusTracker tenant={tenant} />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <AnnouncementsPanel property={property} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentsViewer tenant={tenant} property={property} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}