import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/contractor/TaskList';
import TaskDetail from '@/components/contractor/TaskDetail';
import InvoiceSubmission from '@/components/contractor/InvoiceSubmission';
import { Wrench, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function ContractorDashboard() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => base44.auth.me(),
  });

  const { data: assignedTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['contractorTasks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.MaintenanceRequest.filter({
        assigned_contractor_email: user.email,
      });
    },
    enabled: !!user?.email,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['contractorInvoices', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Invoice.filter({
        submitted_by: user.email,
      });
    },
    enabled: !!user?.email,
  });

  const statusCounts = {
    assigned: assignedTasks.filter(t => t.status === 'assigned').length,
    in_progress: assignedTasks.filter(t => t.status === 'in_progress').length,
    completed: assignedTasks.filter(t => t.status === 'completed').length,
    pending_approval: invoices.filter(i => i.status === 'pending_approval').length,
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="text-center p-8">
          <CardTitle>Loading...</CardTitle>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Contractor Portal</h1>
        <p className="text-muted-foreground">Welcome, {user.full_name || user.email}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Assigned</p>
                <p className="text-2xl font-bold">{statusCounts.assigned}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">In Progress</p>
                <p className="text-2xl font-bold">{statusCounts.in_progress}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Completed</p>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Invoices Pending</p>
                <p className="text-2xl font-bold">{statusCounts.pending_approval}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assigned" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned">My Tasks ({assignedTasks.length})</TabsTrigger>
          <TabsTrigger value="invoices">Submit Invoice</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              onBack={() => setSelectedTask(null)}
              onTaskUpdated={() => setSelectedTask(null)}
            />
          ) : (
            <TaskList
              tasks={assignedTasks}
              onSelectTask={setSelectedTask}
              loading={loadingTasks}
            />
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceSubmission contractorEmail={user.email} assignedTasks={assignedTasks} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Track all submitted invoices and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No invoices submitted yet</p>
              ) : (
                <div className="space-y-3">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{inv.description || `Invoice from ${new Date(inv.created_date).toLocaleDateString()}`}</p>
                        <p className="text-sm text-muted-foreground">£{inv.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <Badge variant={
                        inv.status === 'approved' ? 'default' :
                        inv.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {inv.status || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}