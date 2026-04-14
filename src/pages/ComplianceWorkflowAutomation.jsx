import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import ComplianceWorkflowConfig from '@/components/compliance/ComplianceWorkflowConfig';
import { Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ComplianceWorkflowAutomation() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch compliance tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['compliance-tasks'],
    queryFn: () => base44.entities.ComplianceTask.list('-due_date', 100),
    initialData: []
  });

  // Fetch properties for filtering
  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ['properties-for-tasks'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100),
    initialData: []
  });

  const filteredTasks = selectedProperty
    ? tasks.filter(t => t.property_id === selectedProperty)
    : tasks;

  const taskStats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Compliance Workflow Automation"
          subtitle="Configure automatic task creation and notifications for certificate and license expiries"
        />

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="tasks">Automated Tasks</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" className="mt-8">
            <div className="bg-card rounded-lg border border-border p-8">
              <ComplianceWorkflowConfig />
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary opacity-20" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{taskStats.pending}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500 opacity-20" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Urgent</p>
                    <p className="text-2xl font-bold text-red-600">{taskStats.urgent}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500 opacity-20" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
                </div>
              </Card>
            </div>

            {/* Filter */}
            <div className="bg-card border border-border rounded-lg p-4">
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by Property (optional)
              </label>
              <select
                value={selectedProperty || ''}
                onChange={(e) => setSelectedProperty(e.target.value || null)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Properties</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.address_line_1} {prop.postcode}
                  </option>
                ))}
              </select>
            </div>

            {/* Tasks List */}
            {tasksLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-semibold">No automated tasks</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All compliance dates are on track or automation is not yet configured.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div key={task.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            {task.due_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Due: {format(parseISO(task.due_date), 'dd MMM yyyy')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}