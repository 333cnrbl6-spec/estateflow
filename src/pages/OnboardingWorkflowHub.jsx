import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Play, Zap } from 'lucide-react';
import { toast } from 'sonner';
import RelationshipOnboardingWorkflow from '@/components/workflows/RelationshipOnboardingWorkflow';

export default function OnboardingWorkflowHub() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow?.list?.('-updated_date', 50) || Promise.resolve([])
  });

  const handleInitializeWorkflow = async (entityId, entityType, relationshipType) => {
    try {
      const result = await base44.functions.invoke('initializeRelationshipOnboarding', {
        entityId,
        entityType,
        relationshipType
      });

      toast.success(`Onboarding started for ${result.entity}`);
      setShowNewWorkflow(false);
    } catch (error) {
      toast.error('Failed to start workflow: ' + error.message);
    }
  };

  const statuses = {
    pending: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
    in_progress: { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    on_hold: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' }
  };

  const activeWorkflows = workflows.filter(w => ['pending', 'in_progress'].includes(w.status));
  const completedWorkflows = workflows.filter(w => w.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Onboarding Workflow Hub</h1>
          <p className="text-muted-foreground">Manage automated onboarding sequences for vendors, contractors, and other relationships</p>
        </div>

        {selectedWorkflow ? (
          <div>
            <Button
              variant="outline"
              onClick={() => setSelectedWorkflow(null)}
              className="mb-6"
            >
              ← Back to Workflows
            </Button>
            <RelationshipOnboardingWorkflow workflowId={selectedWorkflow} />
          </div>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeWorkflows.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedWorkflows.length})
              </TabsTrigger>
              <TabsTrigger value="new">
                New Workflow
              </TabsTrigger>
            </TabsList>

            {/* Active Workflows */}
            <TabsContent value="active" className="space-y-4">
              {activeWorkflows.length === 0 ? (
                <Card className="p-12 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active workflows</p>
                </Card>
              ) : (
                activeWorkflows.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onSelect={() => setSelectedWorkflow(workflow.id)}
                    statuses={statuses}
                  />
                ))
              )}
            </TabsContent>

            {/* Completed Workflows */}
            <TabsContent value="completed" className="space-y-4">
              {completedWorkflows.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No completed workflows</p>
                </Card>
              ) : (
                completedWorkflows.map(workflow => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onSelect={() => setSelectedWorkflow(workflow.id)}
                    statuses={statuses}
                  />
                ))
              )}
            </TabsContent>

            {/* New Workflow */}
            <TabsContent value="new">
              <NewWorkflowForm onInitialize={handleInitializeWorkflow} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function WorkflowCard({ workflow, onSelect, statuses }) {
  const statusConfig = statuses[workflow.status];
  const StatusIcon = statusConfig?.icon || Clock;

  const progressPercent = ((workflow.current_stage + 1) / workflow.total_stages) * 100;

  return (
    <Card
      className="p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig?.color}`} />
            <h3 className="font-bold text-foreground">{workflow.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {workflow.relationship_type.replace(/_/g, ' ')} • Stage {workflow.current_stage + 1} of {workflow.total_stages}
          </p>
        </div>
        <Badge className={statusConfig?.bg}>{workflow.status.replace(/_/g, ' ')}</Badge>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {workflow.due_date && (
        <p className="text-xs text-muted-foreground">
          Due: {new Date(workflow.due_date).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}

function NewWorkflowForm({ onInitialize }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState('Vendor');
  const [relationshipType, setRelationshipType] = useState('vendor');
  const [loading, setLoading] = useState(false);

  const relationshipTypes = [
    { value: 'vendor', label: 'Vendor/Contractor' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'customer', label: 'Customer/Tenant' }
  ];

  const handleStart = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a name or ID');
      return;
    }

    setLoading(true);
    try {
      const results = await base44.entities[entityType]?.filter?.({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { full_name: { $regex: searchQuery, $options: 'i' } },
          { id: searchQuery }
        ]
      }, '-updated_date', 5);

      if (!results || results.length === 0) {
        toast.error('Entity not found');
        setLoading(false);
        return;
      }

      await onInitialize(results[0].id, entityType, relationshipType);
      setSearchQuery('');
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Initialize New Onboarding Workflow</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-md bg-background"
            >
              <option>Vendor</option>
              <option>Contact</option>
              <option>Company</option>
              <option>Tenant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Relationship Type</label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-md bg-background"
            >
              {relationshipTypes.map(rt => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search Entity</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter name or ID..."
            className="w-full px-4 py-2 border border-input rounded-md bg-background"
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
          />
        </div>

        <Button
          onClick={handleStart}
          disabled={loading || !searchQuery.trim()}
          className="w-full gap-2"
        >
          {loading ? 'Starting...' : <>
            <Play className="w-4 h-4" />
            Start Onboarding Workflow
          </>}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-2">This will:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Create automated onboarding workflow</li>
          <li>Request required documents based on relationship type</li>
          <li>Assign review tasks to admin team</li>
          <li>Track completion of each stage</li>
          <li>Send notifications at each milestone</li>
        </ul>
      </div>
    </Card>
  );
}