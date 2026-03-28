import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2, Clock, Play, Trash2, Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import WorkflowFormDialog from '@/components/workflows/WorkflowFormDialog';
import PendingExecutionsPanel from '@/components/workflows/PendingExecutionsPanel';

export default function Workflows() {
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const queryClient = useQueryClient();

  // Fetch workflows
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list()
  });

  // Fetch pending executions
  const { data: pendingExecutions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['workflowExecutions', 'pending'],
    queryFn: () => base44.entities.WorkflowExecution.filter({ status: 'pending' })
  });

  // Fetch completed executions
  const { data: completedExecutions = [], isLoading: completedLoading } = useQuery({
    queryKey: ['workflowExecutions', 'completed'],
    queryFn: () => base44.entities.WorkflowExecution.filter({ status: { $in: ['executed', 'rejected', 'skipped'] } })
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: (workflow) => base44.entities.Workflow.update(workflow.id, { is_active: !workflow.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] })
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (workflowId) => base44.entities.Workflow.delete(workflowId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] })
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: (executionId) => base44.functions.invoke('executeWorkflow', { execution_id: executionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowExecutions'] });
    }
  });

  const rejectExecutionMutation = useMutation({
    mutationFn: (executionId) => base44.entities.WorkflowExecution.update(executionId, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflowExecutions'] })
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Workflow Engine" 
        subtitle="Automate maintenance and compliance tasks based on property events"
      >
        <Button onClick={() => setShowNewWorkflow(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Workflow
        </Button>
      </PageHeader>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Actions
            {pendingExecutions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                {pendingExecutions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows">Workflow Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pending Executions */}
        <TabsContent value="pending" className="space-y-4">
          {executionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : pendingExecutions.length === 0 ? (
            <EmptyState 
              title="No pending actions" 
              description="All workflow actions have been reviewed and executed"
            />
          ) : (
            <div className="space-y-3">
              {pendingExecutions.map(execution => (
                <PendingExecutionsPanel 
                  key={execution.id}
                  execution={execution}
                  onApprove={() => executeWorkflowMutation.mutate(execution.id)}
                  onReject={() => rejectExecutionMutation.mutate(execution.id)}
                  isExecuting={executeWorkflowMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Workflow Templates */}
        <TabsContent value="workflows" className="space-y-4">
          {workflowsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : workflows.length === 0 ? (
            <EmptyState 
              title="No workflows" 
              description="Create a workflow to automate property event-based tasks"
              actionLabel="Create Workflow"
              onAction={() => setShowNewWorkflow(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {workflows.map(workflow => (
                <Card key={workflow.id} className={!workflow.is_active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Trigger: <span className="font-medium">{workflow.trigger_type.replace(/_/g, ' ').toUpperCase()}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => toggleWorkflowMutation.mutate(workflow)}
                        >
                          {workflow.is_active ? '✓' : '○'}
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trigger Days:</span>
                      <span className="ml-2 font-medium">{workflow.days_before || 'N/A'} days before</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actions:</span>
                      <span className="ml-2 font-medium">{workflow.actions?.length || 0} action(s)</span>
                    </div>
                    <div className="pt-2 border-t">
                      {workflow.actions?.slice(0, 2).map((action, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          • {action.action_type.replace(/_/g, ' ')}
                        </p>
                      ))}
                      {workflow.actions?.length > 2 && (
                        <p className="text-xs text-muted-foreground">• +{workflow.actions.length - 2} more</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          {completedLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : completedExecutions.length === 0 ? (
            <EmptyState title="No history yet" description="Completed workflow actions will appear here" />
          ) : (
            <div className="space-y-2">
              {completedExecutions.map(execution => (
                <Card key={execution.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{execution.workflow_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {execution.property_address} • {execution.tenant_name}
                      </p>
                    </div>
                    <StatusBadge status={execution.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showNewWorkflow && (
        <WorkflowFormDialog 
          onClose={() => setShowNewWorkflow(false)}
          onSuccess={() => {
            setShowNewWorkflow(false);
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
          }}
        />
      )}
    </div>
  );
}