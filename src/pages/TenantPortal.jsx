import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/shared/StatCard';
import { Calendar, FileText, Wrench, Bell, Home, DollarSign } from 'lucide-react';

export default function TenantPortal() {
  const [tenantId, setTenantId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      setAccessToken(token);
      // Decode token to get tenant ID (simplified)
      setTenantId(atob(token).split(':')[0]);
    }
  }, []);

  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => base44.entities.Tenant.get(tenantId),
    enabled: !!tenantId,
  });

  const { data: rentLedger = [] } = useQuery({
    queryKey: ['rentLedger', tenantId],
    queryFn: () =>
      tenantId
        ? base44.entities.RentLedger.filter({ tenant_id: tenantId })
        : Promise.resolve([]),
    enabled: !!tenantId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['tenantDocuments', tenantId],
    queryFn: () =>
      tenantId
        ? base44.entities.Document.filter({ tenant_id: tenantId })
        : Promise.resolve([]),
    enabled: !!tenantId,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['tenantNotifications', tenantId],
    queryFn: () =>
      tenantId
        ? base44.entities.TenantNotification.filter({ tenant_id: tenantId })
        : Promise.resolve([]),
    enabled: !!tenantId,
  });

  const { data: maintenanceOrders = [] } = useQuery({
    queryKey: ['tenantMaintenance', tenantId],
    queryFn: () =>
      tenantId
        ? base44.entities.MaintenanceOrder.filter({ reported_by: tenantId })
        : Promise.resolve([]),
    enabled: !!tenantId,
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.TenantNotification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantNotifications', tenantId] });
    },
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantMaintenance', tenantId] });
    },
  });

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading tenant portal...</p>
      </div>
    );
  }

  const totalDue = rentLedger
    .filter((r) => r.status === 'overdue')
    .reduce((sum, r) => sum + r.amount, 0);

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-serif font-bold text-foreground">Welcome, {tenant.full_name}</h1>
          <p className="text-muted-foreground mt-2">{tenant.property_id ? 'Your Property Portal' : 'Tenant Dashboard'}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Rent Due"
            value={`£${totalDue.toLocaleString()}`}
            isHighlight={totalDue > 0}
          />
          <StatCard
            label="Last Payment"
            value={rentLedger[0]?.paid_date ? new Date(rentLedger[0].paid_date).toLocaleDateString() : 'None'}
          />
          <StatCard
            label="Notifications"
            value={unreadNotifications.toString()}
          />
          <StatCard
            label="Maintenance Requests"
            value={maintenanceOrders.length.toString()}
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="rent" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rent" className="gap-2">
              <DollarSign className="w-4 h-4" /> Rent & Payments
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" /> Documents
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="w-4 h-4" /> Maintenance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" /> Updates
            </TabsTrigger>
          </TabsList>

          {/* Rent & Payments Tab */}
          <TabsContent value="rent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rentLedger.length > 0 ? (
                    rentLedger.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-muted-foreground">{entry.due_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{entry.amount.toLocaleString()}</p>
                          <p className={`text-sm ${entry.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No payment history</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                          </div>
                        </div>
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            Download
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No documents available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceOrders.length > 0 ? (
                    maintenanceOrders.map((order) => (
                      <div key={order.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{order.title}</p>
                            <p className="text-sm text-muted-foreground">{order.category}</p>
                          </div>
                          <span className={`text-sm px-2 py-1 rounded ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{order.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No maintenance requests</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Updates & Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => markNotificationReadMutation.mutate(notif.id)}>
                            <p className="font-medium">{notif.title}</p>
                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.sent_date}</p>
                          </div>
                          {!notif.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No notifications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}