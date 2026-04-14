import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Home, FileText, MessageSquare, Wrench, AlertTriangle } from 'lucide-react';
import TenantMaintenanceSubmission from '@/components/tenant/TenantMaintenanceSubmission';
import TenantRequestTracker from '@/components/tenant/TenantRequestTracker';
import TenantAnnouncementsPanel from '@/components/tenant/TenantAnnouncementsPanel';
import { format, parseISO } from 'date-fns';

export default function TenantCommunicationPortal() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    setToken(tokenParam || null);

    if (!tokenParam) {
      setError('Invalid access token');
    }
  }, []);

  // Fetch and validate token
  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['tenant-access-token', token],
    enabled: !!token,
    queryFn: async () => {
      try {
        const tokens = await base44.entities.TenantAccessToken.filter(
          { token: token, is_active: true },
          '-created_at',
          1
        );

        if (tokens.length === 0) {
          throw new Error('Invalid or expired token');
        }

        const tokenRecord = tokens[0];
        
        // Check expiry
        if (new Date(tokenRecord.expires_at) < new Date()) {
          throw new Error('Token has expired');
        }

        // Update last used
        await base44.entities.TenantAccessToken.update(tokenRecord.id, {
          last_used: new Date().toISOString()
        });

        return tokenRecord;
      } catch (err) {
        setError(err.message);
        return null;
      }
    }
  });

  // Fetch tenant and property
  const { data: tenant = null } = useQuery({
    queryKey: ['tenant', tokenData?.tenant_id],
    enabled: !!tokenData?.tenant_id,
    queryFn: () => base44.entities.Tenant.get(tokenData.tenant_id)
  });

  const { data: property = null } = useQuery({
    queryKey: ['property', tokenData?.property_id],
    enabled: !!tokenData?.property_id,
    queryFn: () => base44.entities.Property.get(tokenData.property_id)
  });

  const { data: unit = null } = useQuery({
    queryKey: ['unit', tokenData?.unit_id],
    enabled: !!tokenData?.unit_id,
    queryFn: async () => {
      const units = await base44.entities.Unit.filter(
        { property_id: tokenData.property_id },
        '-created_date',
        1
      );
      return units[0] || null;
    }
  });

  // Error states
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 dark:text-red-200 font-semibold">Invalid Access</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">
            No valid access token provided. Please use the link provided by your property manager.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-800 dark:text-red-200 font-semibold">Access Denied</p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!tenant || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground font-semibold">Unable to load property information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tenant Portal</h1>
              <p className="text-muted-foreground mt-1">{property.address_line_1}, {property.postcode}</p>
              {tenant && (
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome, {tenant.first_name || tenant.full_name}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Portal Access</p>
              <p className="font-semibold text-foreground">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Updates</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Track Requests */}
          <TabsContent value="requests" className="mt-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Maintenance Requests</h3>
              <TenantRequestTracker propertyId={property.id} unitId={unit?.id} />
            </div>
          </TabsContent>

          {/* Submit Request */}
          <TabsContent value="submit" className="mt-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Submit Maintenance Request</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Describe the issue and upload photos to help our team understand what needs to be repaired.
              </p>
              <TenantMaintenanceSubmission propertyId={property.id} unitId={unit?.id} />
            </div>
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements" className="mt-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Property Updates & Announcements</h3>
              <TenantAnnouncementsPanel propertyId={property.id} />
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Important Documents</h3>
              <DocumentAccessPanel propertyId={property.id} unitId={unit?.id} tenantId={tenant.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DocumentAccessPanel({ propertyId, unitId, tenantId }) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['tenant-documents', propertyId, tenantId],
    queryFn: async () => {
      const docs = await base44.entities.Document.filter(
        { 
          $or: [
            { property_id: propertyId, document_type: 'Tenancy Agreement' },
            { property_id: propertyId, document_type: 'Certificate' }
          ]
        },
        '-uploaded_date',
        20
      );
      return docs;
    }
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading documents...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-muted-foreground font-semibold">No documents available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => (
        <a
          key={doc.id}
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doc.document_type} • {format(parseISO(doc.uploaded_date), 'dd MMM yyyy')}
              </p>
            </div>
          </div>
          <span className="text-primary text-sm font-semibold">Download →</span>
        </a>
      ))}
    </div>
  );
}